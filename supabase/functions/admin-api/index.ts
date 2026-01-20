import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Table permissions matrix
const TABLE_PERMISSIONS: Record<string, { select: boolean; insert: boolean; update: boolean; delete: boolean }> = {
  projects: { select: true, insert: false, update: true, delete: false },
  chapters: { select: true, insert: true, update: true, delete: false },
  tactics: { select: true, insert: true, update: true, delete: true },
  glossary: { select: true, insert: true, update: true, delete: true },
  diagrams: { select: true, insert: true, update: true, delete: true },
  quality_scores: { select: true, insert: true, update: false, delete: false },
  issues: { select: true, insert: true, update: true, delete: false },
  pipeline_logs: { select: true, insert: true, update: false, delete: false },
  output_files: { select: true, insert: true, update: false, delete: false },
  // New tables for pipeline expansion
  cross_refs: { select: true, insert: true, update: true, delete: true },
  book_context: { select: true, insert: true, update: true, delete: false },
  decisions: { select: true, insert: true, update: false, delete: false },
  validation_log: { select: true, insert: true, update: false, delete: false },
};

type Action = "select" | "insert" | "update" | "upsert" | "delete";

interface RequestBody {
  action: Action;
  table: string;
  data?: Record<string, unknown> | Record<string, unknown>[];
  filters?: Record<string, unknown>;
  options?: {
    order?: { column: string; ascending?: boolean };
    limit?: number;
    single?: boolean;
    count?: "exact" | "planned" | "estimated";
  };
}

interface ApiResponse {
  success: boolean;
  data: unknown;
  count?: number | null;
  error: { code: string; message: string } | null;
}

function createErrorResponse(code: string, message: string, status: number): Response {
  const body: ApiResponse = {
    success: false,
    data: null,
    error: { code, message },
  };
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function createSuccessResponse(data: unknown, count?: number | null): Response {
  const body: ApiResponse = {
    success: true,
    data,
    count: count ?? undefined,
    error: null,
  };
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

// Apply filters to a query
function applyFilters(query: any, filters: Record<string, unknown>): any {
  let result = query;
  
  for (const [key, value] of Object.entries(filters)) {
    // Check for operator suffix
    const parts = key.split(".");
    const column = parts[0];
    const operator = parts[1] || "eq";
    
    switch (operator) {
      case "eq":
        result = result.eq(column, value);
        break;
      case "neq":
        result = result.neq(column, value);
        break;
      case "gt":
        result = result.gt(column, value);
        break;
      case "gte":
        result = result.gte(column, value);
        break;
      case "lt":
        result = result.lt(column, value);
        break;
      case "lte":
        result = result.lte(column, value);
        break;
      case "like":
        result = result.like(column, value);
        break;
      case "ilike":
        result = result.ilike(column, value);
        break;
      case "is":
        result = result.is(column, value);
        break;
      case "in":
        result = result.in(column, value as unknown[]);
        break;
      case "contains":
        result = result.contains(column, value);
        break;
      case "containedBy":
        result = result.containedBy(column, value);
        break;
      default:
        // Default to eq if no operator specified
        result = result.eq(key, value);
    }
  }
  
  return result;
}

// Apply options to a query
function applyOptions(query: any, options: RequestBody["options"]): any {
  let result = query;
  
  if (!options) return result;
  
  if (options.order) {
    result = result.order(options.order.column, { 
      ascending: options.order.ascending ?? true 
    });
  }
  
  if (options.limit) {
    result = result.limit(options.limit);
  }
  
  if (options.single) {
    result = result.single();
  }
  
  return result;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Only allow POST
  if (req.method !== "POST") {
    return createErrorResponse("INVALID_REQUEST", "Only POST method is allowed", 405);
  }

  // Validate authorization
  const authHeader = req.headers.get("Authorization");
  const adminSecret = Deno.env.get("ADMIN_API_SECRET");
  
  if (!adminSecret) {
    console.error("ADMIN_API_SECRET not configured");
    return createErrorResponse("SERVER_ERROR", "Server configuration error", 500);
  }

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    console.warn("Failed auth attempt: Missing or invalid Authorization header");
    return createErrorResponse("UNAUTHORIZED", "Missing or invalid Authorization header", 401);
  }

  const providedSecret = authHeader.replace("Bearer ", "");
  if (providedSecret !== adminSecret) {
    console.warn("Failed auth attempt: Invalid API secret");
    return createErrorResponse("UNAUTHORIZED", "Invalid API secret", 401);
  }

  // Parse request body
  let body: RequestBody;
  try {
    body = await req.json();
  } catch {
    return createErrorResponse("INVALID_REQUEST", "Invalid JSON body", 400);
  }

  // Validate required fields
  if (!body.action || !body.table) {
    return createErrorResponse("INVALID_REQUEST", "Missing required fields: action and table", 400);
  }

  // Validate table
  if (!TABLE_PERMISSIONS[body.table]) {
    return createErrorResponse("INVALID_TABLE", `Table '${body.table}' is not allowed`, 400);
  }

  // Validate action for this table
  const permissions = TABLE_PERMISSIONS[body.table];
  const actionKey = body.action === "upsert" ? "insert" : body.action;
  
  if (!permissions[actionKey as keyof typeof permissions]) {
    return createErrorResponse(
      "INVALID_ACTION",
      `Action '${body.action}' is not allowed on table '${body.table}'`,
      400
    );
  }

  // Create Supabase client with service role key
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  
  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  try {
    let query;
    let result;

    switch (body.action) {
      case "select": {
        query = supabase.from(body.table).select("*", { 
          count: body.options?.count 
        });
        
        if (body.filters) {
          query = applyFilters(query, body.filters);
        }
        
        query = applyOptions(query, body.options);
        result = await query;
        break;
      }

      case "insert": {
        if (!body.data) {
          return createErrorResponse("INVALID_REQUEST", "Missing data for insert", 400);
        }
        
        query = supabase.from(body.table).insert(body.data).select();
        result = await query;
        break;
      }

      case "update": {
        if (!body.data) {
          return createErrorResponse("INVALID_REQUEST", "Missing data for update", 400);
        }
        
        if (!body.filters || Object.keys(body.filters).length === 0) {
          return createErrorResponse("INVALID_REQUEST", "Filters required for update", 400);
        }
        
        query = supabase.from(body.table).update(body.data);
        query = applyFilters(query, body.filters);
        query = query.select();
        result = await query;
        break;
      }

      case "upsert": {
        if (!body.data) {
          return createErrorResponse("INVALID_REQUEST", "Missing data for upsert", 400);
        }
        
        query = supabase.from(body.table).upsert(body.data).select();
        result = await query;
        break;
      }

      case "delete": {
        if (!body.filters || Object.keys(body.filters).length === 0) {
          return createErrorResponse("INVALID_REQUEST", "Filters required for delete", 400);
        }
        
        query = supabase.from(body.table).delete();
        query = applyFilters(query, body.filters);
        query = query.select();
        result = await query;
        break;
      }

      default:
        return createErrorResponse("INVALID_ACTION", `Unknown action: ${body.action}`, 400);
    }

    if (result.error) {
      console.error("Database error:", result.error);
      return createErrorResponse("DATABASE_ERROR", result.error.message, 400);
    }

    return createSuccessResponse(result.data, result.count);

  } catch (error) {
    console.error("Unexpected error:", error);
    return createErrorResponse(
      "SERVER_ERROR",
      error instanceof Error ? error.message : "An unexpected error occurred",
      500
    );
  }
});
