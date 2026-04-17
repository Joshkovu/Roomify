const PROJECT_PREFIX = 'roomify_project_'

const jsonError = (statusCode, message, details ={}) => {
    return new Response(JSON.stringify({error:message, ...details}),{
        status:statusCode,
        headers:{"Content-Type":"application/json",
            "Access-Control-Allow-Origin":"*",
        }
    })
}

const jsonOk = (payload, statusCode = 200) => {
    return new Response(JSON.stringify(payload), {
        status: statusCode,
        headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
        },
    });
}

const getUserId = async (userPuter) =>{
    try{
        const user = await userPuter.auth.getUser();
        return user?.uuid || null;

    }catch{
        return null;
    }
}

router.get("/api/projects/list", async (_req, user) => {
    try {
        const userPuter = user.puter;
        if (!userPuter) return jsonError(401, "Unauthorized");

        const userId = await getUserId(userPuter);
        if (!userId) return jsonError(401, "Unauthorized");

        const userProjectPrefix = `${PROJECT_PREFIX}${userId}:`;
        const listed = await userPuter.kv.list();
        const keys = Array.isArray(listed)
            ? listed.map((entry) => (typeof entry === "string" ? entry : entry?.key)).filter(Boolean)
            : [];

        const projectKeys = keys.filter((key) => key.startsWith(userProjectPrefix));
        const projects = (
            await Promise.all(
                projectKeys.map(async (key) => {
                    const raw = await userPuter.kv.get(key);
                    if (!raw) return null;
                    if (typeof raw === "string") {
                        try {
                            return JSON.parse(raw);
                        } catch {
                            return raw;
                        }
                    }
                    return raw;
                })
            )
        ).filter(Boolean);

        return jsonOk({ projects });
    } catch (e) {
        return jsonError(500, "Failed to list projects", { message: e?.message || "Unknown error" });
    }
});

router.get("/api/projects/get", async (req, user) => {
    try {
        const userPuter = user.puter;
        if (!userPuter) return jsonError(401, "Unauthorized");

        const userId = await getUserId(userPuter);
        if (!userId) return jsonError(401, "Unauthorized");

        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");
        if (!id) return jsonError(400, "Missing project id");

        const key = `${PROJECT_PREFIX}${userId}:${id}`;
        const rawProject = await userPuter.kv.get(key);
        if (!rawProject) return jsonError(404, "Project not found");

        const project = typeof rawProject === "string"
            ? (() => {
                    try {
                        return JSON.parse(rawProject);
                    } catch {
                        return rawProject;
                    }
                })()
            : rawProject;

        return jsonOk({ project });
    } catch (e) {
        return jsonError(500, "Failed to get project", { message: e?.message || "Unknown error" });
    }
});

router.post("/api/projects/save", async (req, user) => {
  try {
   const userPuter = user.puter;
   if(!userPuter) return jsonError(401,"Unauthorized");
   const body = await req.json();
   const project = body?.project;
    if(!project?.id || project?.sourceImage) return jsonError(400,"Missing project data");
    const payload = {
        ...project,
        updatedAt: new Date().toISOString(),
        
    }
    const userId = await getUserId(userPuter);
    if(!userId) return jsonError(401,"Unauthorized");
    const key = `${PROJECT_PREFIX}${userId}:${project.id}`;
    await userPuter.kv.put(key, JSON.stringify(payload));
    return new Response(JSON.stringify({success:true}),{
        status:200,
        headers:{"Content-Type":"application/json",
            "Access-Control-Allow-Origin":"*",
        }
    })
    }catch(e){
        return jsonError(500,"Failed to save project",{message:e.message || "Unknown error"})
    }
}
)