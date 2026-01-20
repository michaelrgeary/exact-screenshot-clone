import requests
from typing import Dict, Any, List, Optional, Union
from ..config import config


class AdminAPIError(Exception):
    """Exception raised when Admin API returns an error."""
    def __init__(self, code: str, message: str):
        self.code = code
        self.message = message
        super().__init__(f"{code}: {message}")


class AdminAPIClient:
    """Client for the admin-api Edge Function."""

    def __init__(self, url: str, secret: str):
        self.url = url
        self.secret = secret
        self.headers = {
            "Authorization": f"Bearer {secret}",
            "Content-Type": "application/json"
        }

    def _request(
        self,
        action: str,
        table: str,
        data: Optional[Union[Dict[str, Any], List[Dict[str, Any]]]] = None,
        filters: Optional[Dict[str, Any]] = None,
        options: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Make a request to the Admin API."""
        payload = {
            "action": action,
            "table": table
        }
        if data is not None:
            payload["data"] = data
        if filters is not None:
            payload["filters"] = filters
        if options is not None:
            payload["options"] = options

        response = requests.post(self.url, json=payload, headers=self.headers)

        # Parse response
        result = response.json()

        if not result.get("success", False):
            error = result.get("error", {})
            raise AdminAPIError(
                code=error.get("code", "UNKNOWN_ERROR"),
                message=error.get("message", "Unknown error occurred")
            )

        return result

    def select(
        self,
        table: str,
        filters: Optional[Dict[str, Any]] = None,
        options: Optional[Dict[str, Any]] = None
    ) -> List[Dict[str, Any]]:
        """Select records from a table."""
        result = self._request("select", table, filters=filters, options=options)
        return result.get("data", [])

    def select_single(
        self,
        table: str,
        filters: Optional[Dict[str, Any]] = None
    ) -> Optional[Dict[str, Any]]:
        """Select a single record from a table."""
        result = self._request(
            "select",
            table,
            filters=filters,
            options={"single": True}
        )
        data = result.get("data")
        # Handle both single object and array with one item
        if isinstance(data, list):
            return data[0] if data else None
        return data

    def insert(
        self,
        table: str,
        data: Union[Dict[str, Any], List[Dict[str, Any]]]
    ) -> Union[Dict[str, Any], List[Dict[str, Any]]]:
        """Insert one or more records into a table."""
        result = self._request("insert", table, data=data)
        return result.get("data", [])

    def update(
        self,
        table: str,
        data: Dict[str, Any],
        filters: Dict[str, Any]
    ) -> List[Dict[str, Any]]:
        """Update records in a table."""
        result = self._request("update", table, data=data, filters=filters)
        return result.get("data", [])

    def delete(
        self,
        table: str,
        filters: Dict[str, Any]
    ) -> List[Dict[str, Any]]:
        """Delete records from a table."""
        result = self._request("delete", table, filters=filters)
        return result.get("data", [])


def get_admin_client() -> AdminAPIClient:
    """Get Admin API client instance."""
    if config is None:
        raise RuntimeError("Config not initialized - ensure environment variables are set")
    return AdminAPIClient(config.admin_api_url, config.admin_api_secret)


# Initialize client - will be None if config not available
db: Optional[AdminAPIClient] = None
if config is not None:
    db = get_admin_client()
