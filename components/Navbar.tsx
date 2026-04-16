import { Box } from "lucide-react";
import Button from "./Button";
import { useOutletContext } from "react-router";

const Navbar = () => {
    const {isSignedIn,username,signIn,signOut}= useOutletContext<AuthContext>();
    const handleAuthClick = async  () => {
        if(isSignedIn){
            try{
                await signOut();
            }
            catch(error){
                console.error("Error during sign-out:", error);
            }
            return;
        }
            try{
                await signIn();
            }
            catch(error){
                console.error("Error during sign-in:", error);
            }
        
        // Implement authentication logic here
        console.log("Auth button clicked");
    }

  return (
   <header className="navbar">
    <nav className="inner">
     <div className="left">
        <div className="brand">
            <Box  className="logo"/>
            <span className="name">
                Roomify
            </span>
        </div>
        <ul className="links">
            <a href="#">Product</a>
            <a href="#">Pricing</a>
            <a href="#">Community</a>
            <a href="#">Enterprise</a>
        </ul>
     </div>
     <div className="actions">
        {isSignedIn ? (
            <>
            <span className="greeting">{username ? `Welcome, ${username}` : 'Signed in'}</span>
            <Button size="sm" onClick={handleAuthClick} className="btn">
                Log Out
            </Button>
            </>

        ) : (
            <>
            <Button size="sm" onClick={handleAuthClick} className="login">
                Log in
            </Button>
            <a href="#upload" className="cta">Get Started</a>
            </>
        )}
        
     </div>
    </nav>
   </header>
);
}
export default Navbar;