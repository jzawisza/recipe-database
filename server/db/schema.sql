--
-- PostgreSQL database dump
--

-- Dumped from database version 10.4 (Ubuntu 10.4-2.pgdg18.04+1)
-- Dumped by pg_dump version 10.4 (Ubuntu 10.4-2.pgdg18.04+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET client_min_messages = warning;
SET row_security = off;

SET search_path = public, pg_catalog;

--
-- Name: plpgsql; Type: EXTENSION; Schema: -; Owner: 
--

CREATE EXTENSION IF NOT EXISTS plpgsql WITH SCHEMA pg_catalog;


--
-- Name: EXTENSION plpgsql; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION plpgsql IS 'PL/pgSQL procedural language';

--
-- Sequences
--
CREATE SEQUENCE recipe_id_seq;
CREATE SEQUENCE recipe_link_id_seq;
CREATE SEQUENCE tag_id_seq;
CREATE SEQUENCE user_id_seq;
CREATE SEQUENCE user_favorite_id_seq;

--
-- Tables
--
CREATE TABLE recipes (
      id bigint NOT NULL DEFAULT NEXTVAL('recipe_id_seq') CONSTRAINT recipe_pkey PRIMARY KEY,
      source text,
      title text NOT NULL,
      ingredients text NOT NULL,
      preparation text NOT NULL,
      notes text,
      serves integer,
      calories_per_serving integer,
      data jsonb NOT NULL DEFAULT '{}'::jsonb,
      creation_time timestamp with time zone NOT NULL,
      modified_time timestamp with time zone NOT NULL
);

CREATE TABLE recipe_links (
      id bigint NOT NULL DEFAULT NEXTVAL('recipe_link_id_seq') CONSTRAINT recipe_link_pkey PRIMARY KEY,
      source_id bigint NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
      dest_id bigint NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
      UNIQUE(source_id, dest_id)
);

CREATE TABLE tags (
      id bigint NOT NULL DEFAULT NEXTVAL('tag_id_seq') CONSTRAINT tags_pkey PRIMARY KEY,
      name text NOT NULL UNIQUE
);

CREATE TABLE users (
      id bigint NOT NULL DEFAULT NEXTVAL('user_id_seq') CONSTRAINT user_pkey PRIMARY KEY,
      username text NOT NULL UNIQUE,
      display_name text NOT NULL
);

CREATE TABLE user_favorites (
      id bigint NOT NULL DEFAULT NEXTVAL('user_favorite_id_seq') CONSTRAINT user_favorite_pkey PRIMARY KEY,
      user_id bigint NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      recipe_id bigint NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
      UNIQUE (user_id, recipe_id)
);

--
-- Sequence ownership
--
ALTER SEQUENCE recipe_id_seq OWNED BY recipes.id;
ALTER SEQUENCE recipe_link_id_seq OWNED BY recipe_links.id;
ALTER SEQUENCE tag_id_seq OWNED BY tags.id;
ALTER SEQUENCE user_id_seq OWNED BY users.id;
ALTER SEQUENCE user_favorite_id_seq OWNED BY user_favorites.id;

--
-- Default user
--
INSERT INTO users(id, username, display_name) VALUES(0, 'defaultuser', 'Default User');

--
-- PostgreSQL database dump complete
--

