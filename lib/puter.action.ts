import puter from "@heyputer/puter.js";
import { uploadImageToHosting , getOrCreateHostingConfig} from "./puter.hosting";
import { isHostedUrl } from "./utils";
import { PUTER_WORKER_URL } from "./constants";

export const signIn = async () => await  puter.auth.signIn();
export const signOut =  () => puter.auth.signOut();
export const getCurrentUser = async () => {
    try{
        const user = await puter.auth.getUser();
        return user;
    }
    catch(error){
        console.error("Error fetching current user:", error);
        return null;
    }
};
export const createProject = async ({item, visibility="private"}: CreateProjectParams): Promise<DesignItem| null | undefined> => {
    if(!PUTER_WORKER_URL){
        console.warn("Missing VITE_PUTER_WORKER_URL environment variable, cannot create project");
        return null;
    }
    const projectId = item.id;
    const hosting = await getOrCreateHostingConfig();
    const hostedSource = projectId? await uploadImageToHosting({hosting,url: item.sourceImage,projectId,label: "source"}) : null;
    const hostedRendered = projectId && item.renderedImage? await uploadImageToHosting({hosting,url: item.renderedImage,projectId,label: "rendered"}) : null;
    const resolvedSource = hostedSource?.url || (isHostedUrl(item.sourceImage) ? item.sourceImage : '');
    if(!resolvedSource) {
        console.warn("Failed to resolve source image URL, skipping save ");
        return null;
    }
    const resolvedRendered = hostedRendered?.url ? hostedRendered.url : (item.renderedImage && isHostedUrl(item.renderedImage) ? item.renderedImage : undefined);
   const {
    sourcePath: _sourcePath,
    renderedPath: _renderedPath,
    publicPath: _publicPath,
    ...rest
   } = item;
   const payload = {
    ...rest,
    sourceImage: resolvedSource,
    renderedImage: resolvedRendered
   }
   try{
    const response = await puter.workers.exec(`${PUTER_WORKER_URL}/api/projects/save`,{
        method:"POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({project: payload , visibility}),
    });
    if(!response.ok) {
        const errorBody = await response.text();
        console.error("Failed to create project, response not ok:", response.status, errorBody || response.statusText);
        return null;
     }
     const data = await response.json() as {project?: DesignItem | null};

    return data?.project ?? null;
   }
   catch(e){
    console.log("Error creating project:", e);
    return null;
   }

}
export const getProjects = async ()=>{
    if(!PUTER_WORKER_URL){
        console.warn("Missing VITE_PUTER_WORKER_URL environment variable, cannot fetch projects");
        return [];

    }
    try{
        const response = await puter.workers.exec(`${PUTER_WORKER_URL}/api/projects/list`,{
            method:"GET"
        })
        if(!response.ok) {
            console.error("Failed to fetch projects, response not ok:", response.statusText);
            return [];
        }
        const data = await response.json() as {projects?: DesignItem[] | null};
        return Array.isArray(data.projects) ? data.projects : [];

    }catch(e){
        console.error("Error fetching projects:", e);
        return [];
    }
}
export const getProjectById = async ({ id }: { id: string }) => {
    if (!PUTER_WORKER_URL) {
        console.warn("Missing VITE_PUTER_WORKER_URL; skipping project fetch.");
        return null;
    }

    console.log("Fetching project with ID:", id);

    try {
        const response = await puter.workers.exec(
            `${PUTER_WORKER_URL}/api/projects/get?id=${encodeURIComponent(id)}`,
            { method: "GET" },
        );

        console.log("Fetch project response:", response);

        if (!response.ok) {
            console.error("Failed to fetch project:", await response.text());
            return null;
        }

        const data = (await response.json()) as {
            project?: DesignItem | null;
        };

        console.log("Fetched project data:", data);

        return data?.project ?? null;
    } catch (error) {
        console.error("Failed to fetch project:", error);
        return null;
    }
};