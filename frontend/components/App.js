import React, { useState } from 'react';
import { NavLink, Routes, Route, useNavigate } from 'react-router-dom';
import Articles from './Articles';
import LoginForm from './LoginForm';
import Message from './Message';
import ArticleForm from './ArticleForm';
import Spinner from './Spinner';
import axios from 'axios';
import axiosWithAuth from '../axios';

const articlesUrl = 'http://localhost:9000/api/articles';
const loginUrl = 'http://localhost:9000/api/login';

export default function App() {
  // ✨ MVP can be achieved with these states
  const [message, setMessage] = useState('');
  const [articles, setArticles] = useState([]);
  const [currentArticleId, setCurrentArticleId] = useState();
  const [spinnerOn, setSpinnerOn] = useState(false);

  // ✨ Research `useNavigate` in React Router v.6
  const navigate = useNavigate();
  const redirectToLogin = () => {
    navigate('/');
    /* ✨ implement */
  };
  const redirectToArticles = () => {
    navigate('/articles');
    /* ✨ implement */
  };

  const logout = () => {
    localStorage.removeItem('token');
    setMessage('Goodbye!');
    redirectToLogin();
    // ✨ implement
    // If a token is in local storage it should be removed,
    // and a message saying "Goodbye!" should be set in its proper state.
    // In any case, we should redirect the browser back to the login screen,
    // using the helper above.
  };

  const login = ({ username, password }) => {
    setMessage('');
    setSpinnerOn(true);
    axios
      .post(loginUrl, { username, password })
      .then((res) => {
        const { token } = res.data;
        localStorage.setItem('token', token);
        setSpinnerOn(false);
        setMessage(res.data.message);
        redirectToArticles();
        // console.log('login', res.data);
      })
      .catch((err) => console.log(err));
    // ✨ implement
    // We should flush the message state, turn on the spinner
    // and launch a request to the proper endpoint.
    // On success, we should set the token to local storage in a 'token' key,
    // put the server success message in its proper state, and redirect
    // to the Articles screen. Don't forget to turn off the spinner!
  };

  const getArticles = () => {
    setMessage('');
    setSpinnerOn(true);
    axiosWithAuth()
      .get(articlesUrl)
      .then((res) => {
        setArticles(res.data.articles);
        setSpinnerOn(false);
        setMessage(res.data.message);
      })

      .catch((err) => {
        if (err.response.status === 401) {
          setSpinnerOn(false);
          navigate('/');
        }
      });

    // ✨ implement
    // We should flush the message state, turn on the spinner
    // and launch an authenticated request to the proper endpoint.
    // On success, we should set the articles in their proper state and
    // put the server success message in its proper state.
    // If something goes wrong, check the status of the response:
    // if it's a 401 the token might have gone bad, and we should redirect to login.
    // Don't forget to turn off the spinner!
  };

  const postArticle = (article) => {
    setSpinnerOn(true);
    setMessage('');
    axiosWithAuth()
      .post(articlesUrl, article)
      .then((res) => {
        const { article } = res.data;
        setArticles(articles.concat(article));
        setSpinnerOn(false);
        setMessage(res.data.message);
        // console.log('post', res.data);
      })
      .catch((err) => {
        if (err.response.status === 401) {
          setSpinnerOn(false);
          navigate('/');
        }
      });
    // ✨ implement
    // The flow is very similar to the `getArticles` function.
    // You'll know what to do! Use log statements or breakpoints
    // to inspect the response from the server.
  };

  const updateArticle = ({ article_id, article }) => {
    console.log(article_id, article);
    setMessage('');
    setSpinnerOn(true);
    axiosWithAuth()
      .put(`${articlesUrl}/${article_id}`, article)
      .then((res) => {
        const updateArticle = articles.map((article) => {
          if (article.article_id === article_id) {
            return res.data.article;
          } else {
            return article;
          }
        });
        setArticles(updateArticle);
        setMessage(res.data.message);
        setSpinnerOn(false);
        setCurrentArticleId();
      });
    // ✨ implement
    // You got this!
  };

  const deleteArticle = (article_id) => {
    setMessage('');
    setSpinnerOn(true);
    axiosWithAuth()
      .delete(`${articlesUrl}/${article_id}`)
      .then((res) => {
        setArticles(articles.filter((art) => art.article_id != article_id));
        setSpinnerOn(false);
        setMessage(res.data.message);
      })
      .catch((err) => {
        if (err.response.status === 401) {
          setSpinnerOn(false);
          navigate('/');
        }
      });
    // ✨ implement
  };

  return (
    // ✨ fix the JSX: `Spinner`, `Message`, `LoginForm`, `ArticleForm` and `Articles` expect props ❗
    <>
      <Spinner on={spinnerOn} />
      <Message message={message} />
      <button id="logout" onClick={logout}>
        Logout from app
      </button>
      <div id="wrapper" style={{ opacity: spinnerOn ? '0.25' : '1' }}>
        {' '}
        {/* <-- do not change this line */}
        <h1>Advanced Web Applications</h1>
        <nav>
          <NavLink id="loginScreen" to="/">
            Login
          </NavLink>
          <NavLink id="articlesScreen" to="/articles">
            Articles
          </NavLink>
        </nav>
        <Routes>
          <Route path="/" element={<LoginForm login={login} />} />
          <Route
            path="articles"
            element={
              <>
                <ArticleForm
                  postArticle={postArticle}
                  currentArticle={articles.find(
                    (art) => art.article_id === currentArticleId
                  )}
                  updateArticle={updateArticle}
                  setCurrentArticleId={setCurrentArticleId}
                />
                <Articles
                  articles={articles}
                  getArticles={getArticles}
                  deleteArticle={deleteArticle}
                  setCurrentArticleId={setCurrentArticleId}
                />
              </>
            }
          />
        </Routes>
        <footer>Bloom Institute of Technology 2022</footer>
      </div>
    </>
  );
}
