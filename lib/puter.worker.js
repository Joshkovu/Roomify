const PRIVATE_PROJECT_PREFIX = 'roomify_private_project_';
const PUBLIC_PROJECT_PREFIX = 'roomify_public_project_';

const jsonError = (status, message, extra = {}) => {
    return new Response(JSON.stringify({  error: message, ...extra }), {
        status,
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        }
    })
}

const getUserId = async (userPuter) => {
    try {
        const user = await userPuter.auth.getUser();

        return user?.uuid || null;
    } catch {
        return null;
    }
}

const privateProjectKey = (id) => `${PRIVATE_PROJECT_PREFIX}${id}`;
const publicProjectKey = (id) => `${PUBLIC_PROJECT_PREFIX}${id}`;

const normalizeProject = ({ project, isPublic, userId }) => {
    const next = {
        ...project,
        isPublic,
        updatedAt: new Date().toISOString(),
    };

    if (isPublic) {
        next.sharedAt = project?.sharedAt || new Date().toISOString();
        next.sharedBy = project?.sharedBy || userId;
    } else {
        next.sharedAt = null;
    }

    return next;
};

router.post('/api/projects/save', async ({ request, user }) => {
    try {
        const userPuter = user?.puter;

        if(!userPuter) return jsonError(401, 'Authentication failed');

        const body = await request.json();
        const project = body?.project;

        if(!project?.id || !project?.sourceImage) return jsonError(400, 'Project ID and source image are required');

        const visibility = body?.visibility === 'public' ? 'public' : 'private';

        const userId = await getUserId(userPuter);
        if(!userId) return jsonError(401, 'Authentication failed');

        const payload = normalizeProject({
            project,
            isPublic: visibility === 'public',
            userId,
        });

        const targetKey = visibility === 'public'
            ? publicProjectKey(project.id)
            : privateProjectKey(project.id);
        const staleKey = visibility === 'public'
            ? privateProjectKey(project.id)
            : publicProjectKey(project.id);

        await userPuter.kv.set(targetKey, payload);
        await userPuter.kv.del(staleKey);

        return { saved: true, id: project.id, project: payload }
    } catch (e) {
        return jsonError(500, 'Failed to save project', { message: e.message || 'Unknown error' });
    }
})

router.get('/api/projects/list', async ({ user }) => {
    try {
        const userPuter = user?.puter;
        if (!userPuter) return jsonError(401, 'Authentication failed');

        const userId = await getUserId(userPuter);
        if (!userId) return jsonError(401, 'Authentication failed');

        const privateProjects = (await userPuter.kv.list(PRIVATE_PROJECT_PREFIX, true))
            .map(({ value }) => ({ ...value, isPublic: false }));
        const publicProjects = (await userPuter.kv.list(PUBLIC_PROJECT_PREFIX, true))
            .map(({ value }) => ({ ...value, isPublic: true }));

        const projects = [...privateProjects, ...publicProjects]
            .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

        return { projects };
    } catch (e) {
        return jsonError(500, 'Failed to list projects', { message: e.message || 'Unknown error' });
    }
})

router.get('/api/projects/get', async ({ request, user }) => {
    try {
        const userPuter = user?.puter;
        if (!userPuter) return jsonError(401, 'Authentication failed');

        const userId = await getUserId(userPuter);
        if (!userId) return jsonError(401, 'Authentication failed');

        const url = new URL(request.url);
        const id = url.searchParams.get('id');

        if (!id) return jsonError(400, 'Project ID is required');

        const privateProject = await userPuter.kv.get(privateProjectKey(id));
        const publicProject = privateProject
            ? null
            : await userPuter.kv.get(publicProjectKey(id));
        const project = privateProject
            ? { ...privateProject, isPublic: false }
            : publicProject
                ? { ...publicProject, isPublic: true }
                : null;

        if (!project) return jsonError(404, 'Project not found');

        return { project };
    } catch (e) {
        return jsonError(500, 'Failed to get project', { message: e.message || 'Unknown error' });
    }
})

router.post('/api/projects/share', async ({ request, user }) => {
    try {
        const userPuter = user?.puter;
        if (!userPuter) return jsonError(401, 'Authentication failed');

        const userId = await getUserId(userPuter);
        if (!userId) return jsonError(401, 'Authentication failed');

        const body = await request.json();
        const id = body?.id;
        if (!id) return jsonError(400, 'Project ID is required');

        const privateKey = privateProjectKey(id);
        const publicKey = publicProjectKey(id);

        const privateProject = await userPuter.kv.get(privateKey);
        const publicProject = privateProject ? null : await userPuter.kv.get(publicKey);
        const sourceProject = privateProject || publicProject;

        if (!sourceProject) return jsonError(404, 'Project not found');

        const sharedProject = normalizeProject({
            project: sourceProject,
            isPublic: true,
            userId,
        });

        await userPuter.kv.set(publicKey, sharedProject);
        await userPuter.kv.del(privateKey);

        return { shared: true, project: sharedProject };
    } catch (e) {
        return jsonError(500, 'Failed to share project', { message: e.message || 'Unknown error' });
    }
});

router.post('/api/projects/unshare', async ({ request, user }) => {
    try {
        const userPuter = user?.puter;
        if (!userPuter) return jsonError(401, 'Authentication failed');

        const userId = await getUserId(userPuter);
        if (!userId) return jsonError(401, 'Authentication failed');

        const body = await request.json();
        const id = body?.id;
        if (!id) return jsonError(400, 'Project ID is required');

        const privateKey = privateProjectKey(id);
        const publicKey = publicProjectKey(id);

        const publicProject = await userPuter.kv.get(publicKey);
        const privateProject = publicProject ? null : await userPuter.kv.get(privateKey);
        const sourceProject = publicProject || privateProject;

        if (!sourceProject) return jsonError(404, 'Project not found');

        const unsharedProject = normalizeProject({
            project: sourceProject,
            isPublic: false,
            userId,
        });

        await userPuter.kv.set(privateKey, unsharedProject);
        await userPuter.kv.del(publicKey);

        return { shared: false, project: unsharedProject };
    } catch (e) {
        return jsonError(500, 'Failed to unshare project', { message: e.message || 'Unknown error' });
    }
});