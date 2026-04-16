import puter from "@heyputer/puter.js";
import { uploadImageToHosting , getOrCreateHostingConfig} from "./puter.hosting";
import { isHostedUrl } from "./utils";

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
export const createProject = async ({item}: CreateProjectParams): Promise<DesignItem| null | undefined> => {
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

    return payload;
   }
   catch(e){
    console.log("Error creating project:", e);
    return null;
   }

}