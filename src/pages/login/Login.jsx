import { GoogleButton } from "react-google-button";
import { UserAuth } from "./AuthContext";
import { useNavigate } from "react-router-dom";
import { useEffect } from 'react';
import classes from './login.scss';

const Login = () => {
  const { googleSignIn, user } = UserAuth();
  const navigate = useNavigate();

  const handleGoogleSignIn = async () => {
    try {
      await googleSignIn();
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (user != null) {
      navigate("/");
    }
  }, [user, googleSignIn]);

  return (
    <div className={classes.signInContainer}>
      <div className={classes.roundedRectangle}>
        <div className={classes.modelcontainer}>
          <div className={classes.model}>
            <div className={classes.title}>
              <h1 style={{color: 'blue'}}>Sign In</h1>
            </div>
            <div className={classes.buttonContainer}>
              <span className={classes.signInButton}>
                <GoogleButton onClick={handleGoogleSignIn} />
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
