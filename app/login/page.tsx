"use client";

import React from "react";
import { StytchLogin } from "@stytch/nextjs";
import { Products } from "@stytch/vanilla-js";
import { getDomainFromWindow } from '../../lib/urlUtils';
import { useStytch } from '@stytch/react';

/*
 * Login configures and renders the StytchLogin component which is a prebuilt UI component for auth powered by Stytch.
 * 
 * This component accepts style, config, and callbacks props. To learn more about possible options review the documentation at
 * https://stytch.com/docs/sdks/javascript-sdk#ui-configs.
*/
const Login = () => {
  // const stytch = useStytch();

  const styles = {
    container: {
      width: "100%",
    },
    buttons: {
      primary: {
        backgroundColor: "#4A37BE",
        borderColor: "#4A37BE",
      },
    },
  };

  const config = {
    products: [Products.emailMagicLinks],
    emailMagicLinksOptions: {
      loginRedirectURL: getDomainFromWindow() + '/authenticate',
      loginExpirationMinutes: 60,
      signupRedirectURL: getDomainFromWindow() + '/authenticate',
      signupExpirationMinutes: 60,
    },
  } as Parameters<typeof StytchLogin>[0]["config"];

  
  // const startOAuth = () =>
  //   stytch.oauth.google.start({
  //     login_redirect_url: 'https://example.com/authenticate',
  //     signup_redirect_url: 'https://example.com/authenticate',
  //     custom_scopes: [
  //       'https://www.googleapis.com/auth/documents.readonly',
  //       'https://www.googleapis.com/auth/drive.readonly',
  //     ],
  //     provider_params: {
  //       login_hint: 'example_hint@stytch.com',
  //     },
  //   });

  return <div className="flex items-center justify-center  h-screen">
    <div className="md:w-1/2 self-center h-[500px] flex items-center justify-center">
  {/* <button onClick={startOAuth}>Log in with Google</button>   */}
  <StytchLogin config={config} styles={styles} />
  </div>
     </div>
};

export default Login;