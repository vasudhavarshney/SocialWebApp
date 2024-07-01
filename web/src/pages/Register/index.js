import React, { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";

import logo from "../../assets/logo.svg";

import api from "../../services/api";
import { login } from "../../services/auth";

import { Container, Gif, FormContainer, Form, Footer } from "./styles";

import ErrorMessage from "../../components/ErrorMessage";

export default function Register({ history }) {
  const initialState = {
    name: "",
    email: "",
    username: "",
    password: ""
  };

  const [user, setUser] = useState(initialState);
  const [errors, setErrors] = useState([]);

  const handleInputs = e => {
    setUser({
      ...user,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const { name, email, username, password } = user;

    try {
      const res = await api.post("/users", { name, email, username, password });
      if (res.status === 200) {
        const { token } = res.data;
        login(token);
        history.push("/");
      }
    } catch (err) {
      const arrayErrors = err.response?.data.errors;
      setErrors(arrayErrors);

      err.response?.data.message &&
        toast.error(` 😪 ${err.response?.data.message}`);
    }
  };

  return (
    <Container>
      <Gif src="./img/mobilegif.gif" alt="gif" height="620" />

      <FormContainer>
        <Form onSubmit={handleSubmit}>
          <img src={logo} alt="logo" width="230" />
          <span>Sign up to see photos and videos of your friends</span>
          <hr />
          <input
            type="text"
            name="name"
            value={user.name}
            onChange={handleInputs}
            placeholder="Enter your full name"
          />
          {errors &&
            errors.map(
              (error, index) =>
                error.param === "name" && (
                  <ErrorMessage key={index} error={error.msg} />
                )
            )}
          <input
            type="email"
            name="email"
            value={user.email}
            onChange={handleInputs}
            placeholder="Enter your email"
          />
          {errors &&
            errors.map(
              (error, index) =>
                error.param === "email" && (
                  <ErrorMessage key={index} error={error.msg} />
                )
            )}
          <input
            type="text"
            name="username"
            value={user.username}
            onChange={handleInputs}
            placeholder="Choose a userName"
          />
          {errors &&
            errors.map(
              (error, index) =>
                error.param === "username" && (
                  <ErrorMessage key={index} error={error.msg} />
                )
            )}
          <input
            type="password"
            name="password"
            value={user.password}
            onChange={handleInputs}
            placeholder="password"
          />
          {errors &&
            errors.map(
              (error, index) =>
                error.param === "password" && (
                  <ErrorMessage key={index} error={error.msg} />
                )
            )}
          <input className="button" type="submit" value="Sign up" />

          <hr />

          <span className="footer">
            By registering, you accept our Terms, Data Policy and
            Cookies Policy
          </span>
        </Form>
        <Footer>
          <p>
            You have an account? <Link to="/login">Enter</Link>
          </p>
        </Footer>
      </FormContainer>
    </Container>
  );
}
