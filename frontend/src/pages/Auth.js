import React, { useState, useContext } from "react";

import AuthContext from "../context/auth-context";

import "./Auth.css";

const AuthPage = () => {
  const authContext = useContext(AuthContext);
  const [formValues, setFormValues] = useState(null);
  const [isLogin, setIsLogin] = useState(true);

  // console.log(authContext);

  const handleInputChange = (e) => {
    setFormValues({
      ...formValues,
      [e.target.name]: e.target.value,
    });
  };

  const switchModeHandler = () => {
    setIsLogin(!isLogin);
  };

  const submitHandler = (event) => {
    event.preventDefault();
    if (
      formValues.email.trim().length === 0 ||
      formValues.password.trim().length === 0
    ) {
      return;
    }

    let requestBody = {
      query: `
        query Login ($email: String!, $password: String!) {
          login(email: $email, password: $password) {
            userId
            token
            tokenExpiration
          }
        }
      `,
      variables: {
        email: formValues.email,
        password:formValues.password
      }
    };

    if (!isLogin) {
      requestBody = {
        query: `
          mutation CreateUser($email: String!, $password: String!) {
            createUser(userInput: {email: $email, password: $password}) {
              _id
              email
            }
          }
        `,
        variables: {
          email: formValues.email,
          password:formValues.password
        }
      };
    }

    fetch("http://localhost:9000/graphql", {
      method: "POST",
      body: JSON.stringify(requestBody),
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((res) => {
        if (res.status !== 200 && res.status !== 201) {
          throw new Error("Failed!");
        }
        return res.json();
      })
      .then((resData) => {
        if (resData.data.login.token) {
          authContext.login(
            resData.data.login.token,
            resData.data.login.userId,
            resData.data.login.tokenExpiration
          );
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };
  return (
    <form className="auth-form" onSubmit={submitHandler}>
      <div className="form-control">
        <label htmlFor="email">E-Mail</label>
        <input
          name="email"
          type="email"
          id="email"
          onChange={handleInputChange}
        />
      </div>
      <div className="form-control">
        <label htmlFor="password">Password</label>
        <input
          name="password"
          type="password"
          id="password"
          onChange={handleInputChange}
        />
      </div>
      <div className="form-actions">
        <button type="submit">Submit</button>
        <button type="button" onClick={switchModeHandler}>
          Switch to {isLogin ? "Signup" : "Login"}
        </button>
      </div>
    </form>
  );
};

export default AuthPage;
