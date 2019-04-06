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
-- Tables
--
CREATE TABLE recipes (
      id bigserial NOT NULL CONSTRAINT recipe_pkey PRIMARY KEY,
      source text,
      title text NOT NULL UNIQUE,
      ingredients text NOT NULL,
      preparation text NOT NULL,
      notes text,
      serves integer,
      calories_per_serving integer,
      data jsonb NOT NULL DEFAULT '{}'::jsonb,
      document_vector tsvector,
      source_vector tsvector,
      title_vector tsvector,
      ingredients_vector tsvector,
      tags_vector tsvector,
      creation_time timestamp with time zone NOT NULL,
      modified_time timestamp with time zone NOT NULL
);

CREATE TABLE recipe_links (
      id bigserial NOT NULL CONSTRAINT recipe_link_pkey PRIMARY KEY,
      source_id bigint NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
      dest_id bigint NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
      UNIQUE(source_id, dest_id)
);

CREATE TABLE tags (
      id bigserial NOT NULL CONSTRAINT tags_pkey PRIMARY KEY,
      name text NOT NULL UNIQUE
);

CREATE TABLE users (
      id bigserial NOT NULL CONSTRAINT user_pkey PRIMARY KEY,
      username text NOT NULL UNIQUE,
      display_name text NOT NULL
);

CREATE TYPE saved_recipe_type AS ENUM('FAVORITES', 'MEAL_PLANNER');

CREATE TABLE saved_recipes (
      id bigserial NOT NULL CONSTRAINT saved_recipes_pkey PRIMARY KEY,
      user_id bigint NOT NULL,
      recipe_id bigint NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
      type saved_recipe_type NOT NULL,
      value boolean NOT NULL,
      UNIQUE (user_id, recipe_id, type, value)
);

--
-- Indexes for free-text search
--
CREATE INDEX idx_fts_document_vector ON recipes USING gin(document_vector);
CREATE INDEX idx_fts_source_vector ON recipes USING gin(source_vector);
CREATE INDEX idx_fts_title_vector ON recipes USING gin(title_vector);
CREATE INDEX idx_fts_ingredients_vector ON recipes USING gin(ingredients_vector);
CREATE INDEX idx_fts_tags_vector ON recipes USING gin(tags_vector);

--
-- Default user
--
INSERT INTO users(id, username, display_name) VALUES(0, 'defaultuser', 'Default User');

--
-- Helper function to get tag name string from recipe metadata
--
CREATE OR REPLACE FUNCTION get_tag_name_string_from_metadata(IN metadata jsonb)
RETURNS text AS $$
DECLARE
      tag_name_str text;
BEGIN
      select array_to_string(array(select jsonb_array_elements(metadata->'tags')->'name'), ' ') INTO tag_name_str;
      RETURN tag_name_str;
END;
$$ LANGUAGE plpgsql;


--
-- Trigger functions
--
CREATE OR REPLACE FUNCTION update_search_vectors()
RETURNS TRIGGER AS $$
DECLARE
      tag_name_str text;
      document_text text;
BEGIN
      document_text = '';

      IF NEW.source IS NOT NULL THEN
            document_text := document_text || NEW.source || ' ';
      END IF;
      IF OLD.source IS DISTINCT FROM NEW.source THEN
            SELECT to_tsvector(NEW.source) INTO NEW.source_vector;
      END IF;

      document_text := document_text || NEW.title || ' ';
      IF OLD.title IS DISTINCT FROM NEW.title THEN
            SELECT to_tsvector(NEW.title) INTO NEW.title_vector;            
      END IF;

      document_text := document_text || NEW.ingredients || ' ';
      IF OLD.ingredients IS DISTINCT FROM NEW.ingredients THEN
            SELECT to_tsvector(NEW.ingredients) INTO NEW.ingredients_vector;      
      END IF;

      document_text := document_text || NEW.preparation || ' ';

      IF NEW.notes IS NOT NULL THEN
            document_text := document_text || NEW.notes || ' ';
      END IF;
      
      -- Initialize the tag_name_str variable with the old data,
      -- so we don't write a null string into the document vector
      SELECT get_tag_name_string_from_metadata(OLD.data) INTO tag_name_str;
      IF OLD.data IS DISTINCT FROM NEW.data THEN
            -- Extract tags from metadata
            SELECT get_tag_name_string_from_metadata(NEW.data) INTO tag_name_str;
            SELECT to_tsvector(tag_name_str) INTO NEW.tags_vector;
      END IF;
      document_text := document_text || tag_name_str || ' ';

      IF document_text <> ''
      THEN
            SELECT to_tsvector(document_text) INTO NEW.document_vector;
      END IF;

      RETURN NEW;
END;
$$ LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION insert_search_vectors()
RETURNS TRIGGER AS $$
DECLARE
      tag_name_str text;
      document_text text;
BEGIN
      document_text :=  '';

      IF NEW.source IS NOT NULL THEN
            SELECT to_tsvector(NEW.source) INTO NEW.source_vector;
            document_text := document_text || NEW.source || ' ';
      END IF;

      SELECT to_tsvector(NEW.title) INTO NEW.title_vector;
      document_text := document_text || NEW.title || ' ';

      SELECT to_tsvector(NEW.ingredients) INTO NEW.ingredients_vector;
      document_text := document_text || NEW.ingredients || ' ';

      document_text := document_text || NEW.preparation || ' ';

      IF NEW.notes IS NOT NULL THEN
            document_text := document_text || NEW.notes || ' ';
      END IF;

      IF NEW.data IS NOT NULL THEN
            -- Extract tags from metadata
            SELECT get_tag_name_string_from_metadata(NEW.data) INTO tag_name_str;
            SELECT to_tsvector(tag_name_str) INTO NEW.tags_vector;
            document_text := document_text || tag_name_str || ' ';
      END IF;

      SELECT to_tsvector(document_text) INTO NEW.document_vector;

      RETURN NEW;
END;
$$ LANGUAGE plpgsql;

--
-- Triggers for recipe FTS indexes
--
CREATE TRIGGER fts_recipes_update
      BEFORE UPDATE ON recipes
      FOR EACH ROW
      EXECUTE PROCEDURE update_search_vectors();

CREATE TRIGGER fts_recipes_insert
      BEFORE INSERT ON recipes
      FOR EACH ROW
      EXECUTE PROCEDURE insert_search_vectors();


--
-- PostgreSQL database dump complete
--

