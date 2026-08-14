-- 生成物: `pnpm db:snapshot` が再生成する。手で編集しない。
-- 真実は packages/db/migrations/*.sql。空 DB の高速初期化と CI drift 検査に使う。
--
-- PostgreSQL database dump
--

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: app; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA IF NOT EXISTS app;

--
-- Name: auth; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA IF NOT EXISTS auth;

--
-- Name: pg_cron; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA pg_catalog;

--
-- Name: EXTENSION pg_cron; Type: COMMENT; Schema: -; Owner: -
--

--
-- Name: pgmq; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgmq WITH SCHEMA pgmq;

--
-- Name: EXTENSION pgmq; Type: COMMENT; Schema: -; Owner: -
--

--
-- Name: pgtap; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgtap WITH SCHEMA public;

--
-- Name: EXTENSION pgtap; Type: COMMENT; Schema: -; Owner: -
--

--
-- Name: vector; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS vector WITH SCHEMA public;

--
-- Name: EXTENSION vector; Type: COMMENT; Schema: -; Owner: -
--

--
-- Name: current_user_id(); Type: FUNCTION; Schema: app; Owner: -
--

CREATE OR REPLACE FUNCTION app.current_user_id() RETURNS uuid
    LANGUAGE sql STABLE
    AS $$ SELECT NULLIF(current_setting('app.user_id', true), '')::uuid $$;

--
-- Name: enqueue_attachment_gc(); Type: FUNCTION; Schema: app; Owner: -
--

CREATE OR REPLACE FUNCTION app.enqueue_attachment_gc() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO ''
    AS $$
BEGIN
  PERFORM pgmq.send(
    'attachment_gc',
    jsonb_build_object('bucket', OLD.bucket, 'object_key', OLD.object_key)
  );
  RETURN OLD;
END;
$$;

--
-- Name: gc_stale_attachments(interval); Type: FUNCTION; Schema: app; Owner: -
--

CREATE OR REPLACE FUNCTION app.gc_stale_attachments(older_than interval DEFAULT '1 day'::interval) RETURNS integer
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO ''
    AS $$
DECLARE
  deleted integer;
BEGIN
  DELETE FROM public.attachments
  WHERE app.is_stale_attachment(status, created_at, older_than);
  GET DIAGNOSTICS deleted = ROW_COUNT;
  RETURN deleted;
END;
$$;

--
-- Name: has_role(text); Type: FUNCTION; Schema: app; Owner: -
--

CREATE OR REPLACE FUNCTION app.has_role(p_role text) RETURNS boolean
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public', 'app'
    AS $$
    SELECT EXISTS (
      SELECT 1
      FROM public.users u
      JOIN public.user_roles ur ON ur.user_id = u.id
      WHERE u.gotrue_id = app.current_user_id()
        AND ur.role = p_role
    )
  $$;

--
-- Name: interviews_answer(bigint); Type: FUNCTION; Schema: app; Owner: -
--

CREATE OR REPLACE FUNCTION app.interviews_answer(p_answer_id bigint) RETURNS boolean
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public', 'app'
    AS $$ SELECT EXISTS (
    SELECT 1 FROM public.answers a WHERE a.id = p_answer_id AND a.interviewer_id = app.uid()
  ) $$;

--
-- Name: is_admin(); Type: FUNCTION; Schema: app; Owner: -
--

CREATE OR REPLACE FUNCTION app.is_admin() RETURNS boolean
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public', 'app'
    AS $$
    SELECT EXISTS (
      SELECT 1
      FROM public.users u
      JOIN public.user_roles ur ON ur.user_id = u.id
      WHERE u.gotrue_id = app.current_user_id()
        AND ur.role = 'admin'
    )
  $$;

--
-- Name: is_answer_viewer(bigint); Type: FUNCTION; Schema: app; Owner: -
--

CREATE OR REPLACE FUNCTION app.is_answer_viewer(p_answer_id bigint) RETURNS boolean
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public', 'app'
    AS $$ SELECT EXISTS (
    SELECT 1 FROM public.answer_viewers v WHERE v.answer_id = p_answer_id AND v.user_id = app.uid()
  ) $$;

--
-- Name: is_stale_attachment(integer, timestamp with time zone, interval); Type: FUNCTION; Schema: app; Owner: -
--

CREATE OR REPLACE FUNCTION app.is_stale_attachment(status integer, created_at timestamp with time zone, older_than interval DEFAULT '1 day'::interval) RETURNS boolean
    LANGUAGE sql STABLE
    AS $$ SELECT status = 100 AND created_at < now() - older_than $$;

--
-- Name: owns_or_interviews_answer(bigint); Type: FUNCTION; Schema: app; Owner: -
--

CREATE OR REPLACE FUNCTION app.owns_or_interviews_answer(p_answer_id bigint) RETURNS boolean
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public', 'app'
    AS $$ SELECT EXISTS (
    SELECT 1 FROM public.answers a
    WHERE a.id = p_answer_id AND (a.respondent_id = app.uid() OR a.interviewer_id = app.uid())
  ) $$;

--
-- Name: prevent_last_admin_removal(); Type: FUNCTION; Schema: app; Owner: -
--

CREATE OR REPLACE FUNCTION app.prevent_last_admin_removal() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public', 'app'
    AS $$
  BEGIN
    -- この操作で admin 行が失われるときだけ検査（interviewer 行の操作は素通り）。
    IF OLD.role = 'admin' AND (TG_OP = 'DELETE' OR NEW.role <> 'admin') THEN
      IF (SELECT count(*) FROM public.user_roles WHERE role = 'admin' AND user_id <> OLD.user_id) = 0 THEN
        RAISE EXCEPTION '最後の管理者は降格・削除できません（最低 1 名の admin が必要）';
      END IF;
    END IF;
    RETURN CASE WHEN TG_OP = 'DELETE' THEN OLD ELSE NEW END;
  END;
  $$;

--
-- Name: uid(); Type: FUNCTION; Schema: app; Owner: -
--

CREATE OR REPLACE FUNCTION app.uid() RETURNS bigint
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public', 'app'
    AS $$ SELECT u.id FROM public.users u WHERE u.gotrue_id = app.current_user_id() $$;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: answer_interview_candidates; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.answer_interview_candidates (
    answer_id bigint NOT NULL,
    user_id bigint NOT NULL
);

--
-- Name: answer_viewers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.answer_viewers (
    answer_id bigint NOT NULL,
    user_id bigint NOT NULL
);

--
-- Name: answers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.answers (
    id bigint NOT NULL,
    publication_id bigint NOT NULL,
    respondent_id bigint NOT NULL,
    status integer DEFAULT 100 NOT NULL,
    answer_json jsonb DEFAULT '{}'::jsonb NOT NULL,
    evaluation jsonb,
    health_status integer,
    interview_method integer,
    interviewer_id bigint,
    answered_at timestamp with time zone,
    interview_at timestamp with time zone,
    interview_memo text,
    next_action text,
    supporter_prompt text,
    supporter_answer text,
    user_prompt text,
    user_answer text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    urgency_id bigint,
    embedding public.vector(384),
    CONSTRAINT answers_interview_method_check CHECK ((interview_method = ANY (ARRAY[1, 2, 3])))
);

--
-- Name: answers_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.answers ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.answers_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);

--
-- Name: attachments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.attachments (
    id bigint NOT NULL,
    entity_type text NOT NULL,
    entity_id bigint NOT NULL,
    bucket text NOT NULL,
    object_key text NOT NULL,
    filename text NOT NULL,
    content_type text NOT NULL,
    size_bytes bigint,
    status integer DEFAULT 100 NOT NULL,
    uploaded_by bigint NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT attachments_entity_type_check CHECK ((entity_type = ANY (ARRAY['answer'::text, 'interview'::text, 'user_avatar'::text, 'survey'::text])))
);

--
-- Name: attachments_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.attachments ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.attachments_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);

--
-- Name: departments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.departments (
    id bigint NOT NULL,
    code text NOT NULL,
    name text NOT NULL,
    division_id bigint
);

--
-- Name: departments_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.departments ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.departments_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);

--
-- Name: divisions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.divisions (
    id bigint NOT NULL,
    code text NOT NULL,
    name text NOT NULL
);

--
-- Name: divisions_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.divisions ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.divisions_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);

--
-- Name: positions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.positions (
    id bigint NOT NULL,
    code integer NOT NULL,
    name text NOT NULL
);

--
-- Name: positions_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.positions ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.positions_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);

--
-- Name: questions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.questions (
    id bigint NOT NULL,
    body text NOT NULL,
    answer_type text NOT NULL,
    choices jsonb DEFAULT '[]'::jsonb NOT NULL,
    sort_order integer DEFAULT 0 NOT NULL,
    required boolean DEFAULT false NOT NULL,
    has_extra_field boolean DEFAULT false NOT NULL,
    eval_item text,
    weight numeric,
    tags text[],
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

--
-- Name: questions_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.questions ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.questions_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);

--
-- Name: schedules; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.schedules (
    id bigint NOT NULL,
    title text,
    body text,
    start_at timestamp with time zone,
    end_at timestamp with time zone,
    all_day boolean DEFAULT false NOT NULL,
    color text,
    icon text,
    event_type text,
    created_by bigint,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

--
-- Name: schedules_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.schedules ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.schedules_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);

--
-- Name: schema_migrations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.schema_migrations (
    version text NOT NULL,
    applied_at timestamp with time zone DEFAULT now() NOT NULL
);

--
-- Name: sections; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.sections (
    id bigint NOT NULL,
    code text NOT NULL,
    name text NOT NULL,
    department_id bigint
);

--
-- Name: sections_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.sections ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.sections_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);

--
-- Name: survey_publications; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.survey_publications (
    id bigint NOT NULL,
    survey_id bigint NOT NULL,
    title text,
    body text,
    status integer DEFAULT 100 NOT NULL,
    start_at timestamp with time zone,
    end_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

--
-- Name: survey_publications_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.survey_publications ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.survey_publications_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);

--
-- Name: survey_questions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.survey_questions (
    survey_id bigint NOT NULL,
    question_id bigint NOT NULL,
    sort_order integer DEFAULT 0 NOT NULL
);

--
-- Name: survey_targets; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.survey_targets (
    id bigint NOT NULL,
    survey_id bigint NOT NULL,
    target_type text NOT NULL,
    target_code text NOT NULL,
    CONSTRAINT survey_targets_target_type_check CHECK ((target_type = ANY (ARRAY['position'::text, 'division'::text, 'department'::text, 'section'::text])))
);

--
-- Name: survey_targets_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.survey_targets ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.survey_targets_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);

--
-- Name: surveys; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.surveys (
    id bigint NOT NULL,
    title text NOT NULL,
    status text DEFAULT 'draft'::text NOT NULL,
    capacity integer,
    requires_auth boolean DEFAULT true NOT NULL,
    uses_ai boolean DEFAULT false NOT NULL,
    base_prompt text,
    instruction_set text,
    grounding_context text,
    user_prompt text,
    supporter_prompt text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    urgency_id bigint
);

--
-- Name: surveys_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.surveys ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.surveys_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);

--
-- Name: urgency_levels; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.urgency_levels (
    id bigint NOT NULL,
    code integer NOT NULL,
    name text NOT NULL
);

--
-- Name: urgency_levels_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.urgency_levels ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.urgency_levels_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);

--
-- Name: user_interview_candidates; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_interview_candidates (
    user_id bigint NOT NULL,
    candidate_user_id bigint NOT NULL
);

--
-- Name: user_roles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_roles (
    user_id bigint NOT NULL,
    role text NOT NULL,
    CONSTRAINT user_roles_role_check CHECK ((role = ANY (ARRAY['admin'::text, 'interviewer'::text])))
);

--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id bigint NOT NULL,
    gotrue_id uuid,
    code text NOT NULL,
    name text NOT NULL,
    email text NOT NULL,
    position_id bigint,
    division_id bigint,
    department_id bigint,
    section_id bigint,
    last_login_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.users ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.users_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);

--
-- Name: answer_interview_candidates answer_interview_candidates_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.answer_interview_candidates
    ADD CONSTRAINT answer_interview_candidates_pkey PRIMARY KEY (answer_id, user_id);

--
-- Name: answer_viewers answer_viewers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.answer_viewers
    ADD CONSTRAINT answer_viewers_pkey PRIMARY KEY (answer_id, user_id);

--
-- Name: answers answers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.answers
    ADD CONSTRAINT answers_pkey PRIMARY KEY (id);

--
-- Name: attachments attachments_object_key_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.attachments
    ADD CONSTRAINT attachments_object_key_key UNIQUE (object_key);

--
-- Name: attachments attachments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.attachments
    ADD CONSTRAINT attachments_pkey PRIMARY KEY (id);

--
-- Name: departments departments_code_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.departments
    ADD CONSTRAINT departments_code_key UNIQUE (code);

--
-- Name: departments departments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.departments
    ADD CONSTRAINT departments_pkey PRIMARY KEY (id);

--
-- Name: divisions divisions_code_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.divisions
    ADD CONSTRAINT divisions_code_key UNIQUE (code);

--
-- Name: divisions divisions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.divisions
    ADD CONSTRAINT divisions_pkey PRIMARY KEY (id);

--
-- Name: positions positions_code_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.positions
    ADD CONSTRAINT positions_code_key UNIQUE (code);

--
-- Name: positions positions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.positions
    ADD CONSTRAINT positions_pkey PRIMARY KEY (id);

--
-- Name: questions questions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.questions
    ADD CONSTRAINT questions_pkey PRIMARY KEY (id);

--
-- Name: schedules schedules_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.schedules
    ADD CONSTRAINT schedules_pkey PRIMARY KEY (id);

--
-- Name: schema_migrations schema_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.schema_migrations
    ADD CONSTRAINT schema_migrations_pkey PRIMARY KEY (version);

--
-- Name: sections sections_code_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sections
    ADD CONSTRAINT sections_code_key UNIQUE (code);

--
-- Name: sections sections_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sections
    ADD CONSTRAINT sections_pkey PRIMARY KEY (id);

--
-- Name: survey_publications survey_publications_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.survey_publications
    ADD CONSTRAINT survey_publications_pkey PRIMARY KEY (id);

--
-- Name: survey_questions survey_questions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.survey_questions
    ADD CONSTRAINT survey_questions_pkey PRIMARY KEY (survey_id, question_id);

--
-- Name: survey_targets survey_targets_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.survey_targets
    ADD CONSTRAINT survey_targets_pkey PRIMARY KEY (id);

--
-- Name: surveys surveys_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.surveys
    ADD CONSTRAINT surveys_pkey PRIMARY KEY (id);

--
-- Name: urgency_levels urgency_levels_code_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.urgency_levels
    ADD CONSTRAINT urgency_levels_code_key UNIQUE (code);

--
-- Name: urgency_levels urgency_levels_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.urgency_levels
    ADD CONSTRAINT urgency_levels_pkey PRIMARY KEY (id);

--
-- Name: user_interview_candidates user_interview_candidates_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_interview_candidates
    ADD CONSTRAINT user_interview_candidates_pkey PRIMARY KEY (user_id, candidate_user_id);

--
-- Name: user_roles user_roles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_pkey PRIMARY KEY (user_id, role);

--
-- Name: users users_code_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_code_key UNIQUE (code);

--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);

--
-- Name: users users_gotrue_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_gotrue_id_key UNIQUE (gotrue_id);

--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);

--
-- Name: answers_embedding_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX answers_embedding_idx ON public.answers USING hnsw (embedding public.vector_cosine_ops);

--
-- Name: attachments_entity_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX attachments_entity_idx ON public.attachments USING btree (entity_type, entity_id);

--
-- Name: attachments_one_avatar_per_user; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX attachments_one_avatar_per_user ON public.attachments USING btree (entity_id) WHERE ((entity_type = 'user_avatar'::text) AND (status = 200));

--
-- Name: idx_answers_interviewer; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_answers_interviewer ON public.answers USING btree (interviewer_id);

--
-- Name: idx_answers_publication; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_answers_publication ON public.answers USING btree (publication_id);

--
-- Name: idx_answers_respondent; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_answers_respondent ON public.answers USING btree (respondent_id);

--
-- Name: idx_publications_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_publications_status ON public.survey_publications USING btree (status);

--
-- Name: idx_publications_survey; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_publications_survey ON public.survey_publications USING btree (survey_id);

--
-- Name: idx_schedules_start; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_schedules_start ON public.schedules USING btree (start_at);

--
-- Name: attachments attachments_gc_enqueue; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER attachments_gc_enqueue AFTER DELETE ON public.attachments FOR EACH ROW EXECUTE FUNCTION app.enqueue_attachment_gc();

--
-- Name: user_roles trg_prevent_last_admin_removal; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_prevent_last_admin_removal BEFORE DELETE OR UPDATE ON public.user_roles FOR EACH ROW EXECUTE FUNCTION app.prevent_last_admin_removal();

--
-- Name: answer_interview_candidates answer_interview_candidates_answer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.answer_interview_candidates
    ADD CONSTRAINT answer_interview_candidates_answer_id_fkey FOREIGN KEY (answer_id) REFERENCES public.answers(id) ON DELETE CASCADE;

--
-- Name: answer_interview_candidates answer_interview_candidates_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.answer_interview_candidates
    ADD CONSTRAINT answer_interview_candidates_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;

--
-- Name: answer_viewers answer_viewers_answer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.answer_viewers
    ADD CONSTRAINT answer_viewers_answer_id_fkey FOREIGN KEY (answer_id) REFERENCES public.answers(id) ON DELETE CASCADE;

--
-- Name: answer_viewers answer_viewers_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.answer_viewers
    ADD CONSTRAINT answer_viewers_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;

--
-- Name: answers answers_interviewer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.answers
    ADD CONSTRAINT answers_interviewer_id_fkey FOREIGN KEY (interviewer_id) REFERENCES public.users(id);

--
-- Name: answers answers_publication_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.answers
    ADD CONSTRAINT answers_publication_id_fkey FOREIGN KEY (publication_id) REFERENCES public.survey_publications(id);

--
-- Name: answers answers_respondent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.answers
    ADD CONSTRAINT answers_respondent_id_fkey FOREIGN KEY (respondent_id) REFERENCES public.users(id);

--
-- Name: answers answers_urgency_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.answers
    ADD CONSTRAINT answers_urgency_id_fkey FOREIGN KEY (urgency_id) REFERENCES public.urgency_levels(id);

--
-- Name: attachments attachments_uploaded_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.attachments
    ADD CONSTRAINT attachments_uploaded_by_fkey FOREIGN KEY (uploaded_by) REFERENCES public.users(id);

--
-- Name: departments departments_division_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.departments
    ADD CONSTRAINT departments_division_id_fkey FOREIGN KEY (division_id) REFERENCES public.divisions(id);

--
-- Name: schedules schedules_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.schedules
    ADD CONSTRAINT schedules_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);

--
-- Name: sections sections_department_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sections
    ADD CONSTRAINT sections_department_id_fkey FOREIGN KEY (department_id) REFERENCES public.departments(id);

--
-- Name: survey_publications survey_publications_survey_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.survey_publications
    ADD CONSTRAINT survey_publications_survey_id_fkey FOREIGN KEY (survey_id) REFERENCES public.surveys(id);

--
-- Name: survey_questions survey_questions_question_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.survey_questions
    ADD CONSTRAINT survey_questions_question_id_fkey FOREIGN KEY (question_id) REFERENCES public.questions(id) ON DELETE CASCADE;

--
-- Name: survey_questions survey_questions_survey_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.survey_questions
    ADD CONSTRAINT survey_questions_survey_id_fkey FOREIGN KEY (survey_id) REFERENCES public.surveys(id) ON DELETE CASCADE;

--
-- Name: survey_targets survey_targets_survey_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.survey_targets
    ADD CONSTRAINT survey_targets_survey_id_fkey FOREIGN KEY (survey_id) REFERENCES public.surveys(id) ON DELETE CASCADE;

--
-- Name: surveys surveys_urgency_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.surveys
    ADD CONSTRAINT surveys_urgency_id_fkey FOREIGN KEY (urgency_id) REFERENCES public.urgency_levels(id);

--
-- Name: user_interview_candidates user_interview_candidates_candidate_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_interview_candidates
    ADD CONSTRAINT user_interview_candidates_candidate_user_id_fkey FOREIGN KEY (candidate_user_id) REFERENCES public.users(id) ON DELETE CASCADE;

--
-- Name: user_interview_candidates user_interview_candidates_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_interview_candidates
    ADD CONSTRAINT user_interview_candidates_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;

--
-- Name: user_roles user_roles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;

--
-- Name: users users_department_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_department_id_fkey FOREIGN KEY (department_id) REFERENCES public.departments(id);

--
-- Name: users users_division_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_division_id_fkey FOREIGN KEY (division_id) REFERENCES public.divisions(id);

--
-- Name: users users_position_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_position_id_fkey FOREIGN KEY (position_id) REFERENCES public.positions(id);

--
-- Name: users users_section_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_section_id_fkey FOREIGN KEY (section_id) REFERENCES public.sections(id);

--
-- Name: answer_interview_candidates; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.answer_interview_candidates ENABLE ROW LEVEL SECURITY;

--
-- Name: answer_interview_candidates answer_interview_candidates_select; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY answer_interview_candidates_select ON public.answer_interview_candidates FOR SELECT USING ((app.is_admin() OR app.owns_or_interviews_answer(answer_id)));

--
-- Name: answer_interview_candidates answer_interview_candidates_write; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY answer_interview_candidates_write ON public.answer_interview_candidates USING ((app.is_admin() OR app.interviews_answer(answer_id))) WITH CHECK ((app.is_admin() OR app.interviews_answer(answer_id)));

--
-- Name: answer_viewers; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.answer_viewers ENABLE ROW LEVEL SECURITY;

--
-- Name: answer_viewers answer_viewers_select; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY answer_viewers_select ON public.answer_viewers FOR SELECT USING ((app.is_admin() OR app.owns_or_interviews_answer(answer_id)));

--
-- Name: answer_viewers answer_viewers_write; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY answer_viewers_write ON public.answer_viewers USING ((app.is_admin() OR app.interviews_answer(answer_id))) WITH CHECK ((app.is_admin() OR app.interviews_answer(answer_id)));

--
-- Name: answers; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.answers ENABLE ROW LEVEL SECURITY;

--
-- Name: answers answers_delete; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY answers_delete ON public.answers FOR DELETE USING (app.is_admin());

--
-- Name: answers answers_insert; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY answers_insert ON public.answers FOR INSERT WITH CHECK ((app.is_admin() OR (respondent_id = app.uid())));

--
-- Name: answers answers_select; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY answers_select ON public.answers FOR SELECT USING ((app.is_admin() OR (respondent_id = app.uid()) OR (interviewer_id = app.uid()) OR app.is_answer_viewer(id)));

--
-- Name: answers answers_update; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY answers_update ON public.answers FOR UPDATE USING ((app.is_admin() OR (respondent_id = app.uid()) OR (interviewer_id = app.uid()))) WITH CHECK ((app.is_admin() OR (respondent_id = app.uid()) OR (interviewer_id = app.uid())));

--
-- Name: attachments; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.attachments ENABLE ROW LEVEL SECURITY;

--
-- Name: attachments attachments_select; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY attachments_select ON public.attachments FOR SELECT USING ((app.is_admin() OR ((entity_type = ANY (ARRAY['interview'::text, 'answer'::text])) AND (app.owns_or_interviews_answer(entity_id) OR app.is_answer_viewer(entity_id))) OR ((entity_type = ANY (ARRAY['survey'::text, 'user_avatar'::text])) AND (app.current_user_id() IS NOT NULL))));

--
-- Name: attachments attachments_write; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY attachments_write ON public.attachments USING ((app.is_admin() OR ((entity_type = 'interview'::text) AND app.interviews_answer(entity_id)) OR ((entity_type = 'answer'::text) AND app.owns_or_interviews_answer(entity_id)) OR ((entity_type = 'user_avatar'::text) AND (entity_id = app.uid())))) WITH CHECK (((uploaded_by = app.uid()) AND (app.is_admin() OR ((entity_type = 'interview'::text) AND app.interviews_answer(entity_id)) OR ((entity_type = 'answer'::text) AND app.owns_or_interviews_answer(entity_id)) OR ((entity_type = 'user_avatar'::text) AND (entity_id = app.uid())))));

--
-- Name: departments; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;

--
-- Name: departments departments_select; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY departments_select ON public.departments FOR SELECT USING ((app.current_user_id() IS NOT NULL));

--
-- Name: departments departments_write; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY departments_write ON public.departments USING (app.is_admin()) WITH CHECK (app.is_admin());

--
-- Name: divisions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.divisions ENABLE ROW LEVEL SECURITY;

--
-- Name: divisions divisions_select; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY divisions_select ON public.divisions FOR SELECT USING ((app.current_user_id() IS NOT NULL));

--
-- Name: divisions divisions_write; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY divisions_write ON public.divisions USING (app.is_admin()) WITH CHECK (app.is_admin());

--
-- Name: positions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.positions ENABLE ROW LEVEL SECURITY;

--
-- Name: positions positions_select; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY positions_select ON public.positions FOR SELECT USING ((app.current_user_id() IS NOT NULL));

--
-- Name: positions positions_write; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY positions_write ON public.positions USING (app.is_admin()) WITH CHECK (app.is_admin());

--
-- Name: questions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;

--
-- Name: questions questions_select; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY questions_select ON public.questions FOR SELECT USING ((app.current_user_id() IS NOT NULL));

--
-- Name: questions questions_write; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY questions_write ON public.questions USING (app.is_admin()) WITH CHECK (app.is_admin());

--
-- Name: schedules; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.schedules ENABLE ROW LEVEL SECURITY;

--
-- Name: schedules schedules_select; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY schedules_select ON public.schedules FOR SELECT USING ((app.current_user_id() IS NOT NULL));

--
-- Name: schedules schedules_write; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY schedules_write ON public.schedules USING ((app.is_admin() OR (created_by = app.uid()))) WITH CHECK ((app.is_admin() OR (created_by = app.uid())));

--
-- Name: sections; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.sections ENABLE ROW LEVEL SECURITY;

--
-- Name: sections sections_select; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY sections_select ON public.sections FOR SELECT USING ((app.current_user_id() IS NOT NULL));

--
-- Name: sections sections_write; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY sections_write ON public.sections USING (app.is_admin()) WITH CHECK (app.is_admin());

--
-- Name: survey_publications; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.survey_publications ENABLE ROW LEVEL SECURITY;

--
-- Name: survey_publications survey_publications_select; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY survey_publications_select ON public.survey_publications FOR SELECT USING ((app.current_user_id() IS NOT NULL));

--
-- Name: survey_publications survey_publications_write; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY survey_publications_write ON public.survey_publications USING (app.is_admin()) WITH CHECK (app.is_admin());

--
-- Name: survey_questions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.survey_questions ENABLE ROW LEVEL SECURITY;

--
-- Name: survey_questions survey_questions_select; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY survey_questions_select ON public.survey_questions FOR SELECT USING ((app.current_user_id() IS NOT NULL));

--
-- Name: survey_questions survey_questions_write; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY survey_questions_write ON public.survey_questions USING (app.is_admin()) WITH CHECK (app.is_admin());

--
-- Name: survey_targets; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.survey_targets ENABLE ROW LEVEL SECURITY;

--
-- Name: survey_targets survey_targets_select; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY survey_targets_select ON public.survey_targets FOR SELECT USING ((app.current_user_id() IS NOT NULL));

--
-- Name: survey_targets survey_targets_write; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY survey_targets_write ON public.survey_targets USING (app.is_admin()) WITH CHECK (app.is_admin());

--
-- Name: surveys; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.surveys ENABLE ROW LEVEL SECURITY;

--
-- Name: surveys surveys_select; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY surveys_select ON public.surveys FOR SELECT USING ((app.current_user_id() IS NOT NULL));

--
-- Name: surveys surveys_write; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY surveys_write ON public.surveys USING (app.is_admin()) WITH CHECK (app.is_admin());

--
-- Name: user_interview_candidates uic_select; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY uic_select ON public.user_interview_candidates FOR SELECT USING ((app.is_admin() OR (user_id = app.uid())));

--
-- Name: user_interview_candidates uic_write; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY uic_write ON public.user_interview_candidates USING (app.is_admin()) WITH CHECK (app.is_admin());

--
-- Name: urgency_levels; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.urgency_levels ENABLE ROW LEVEL SECURITY;

--
-- Name: urgency_levels urgency_levels_select; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY urgency_levels_select ON public.urgency_levels FOR SELECT USING ((app.current_user_id() IS NOT NULL));

--
-- Name: urgency_levels urgency_levels_write; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY urgency_levels_write ON public.urgency_levels USING (app.is_admin()) WITH CHECK (app.is_admin());

--
-- Name: user_interview_candidates; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.user_interview_candidates ENABLE ROW LEVEL SECURITY;

--
-- Name: user_roles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

--
-- Name: user_roles user_roles_select; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY user_roles_select ON public.user_roles FOR SELECT USING ((app.is_admin() OR (user_id = app.uid())));

--
-- Name: user_roles user_roles_write; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY user_roles_write ON public.user_roles USING (app.is_admin()) WITH CHECK (app.is_admin());

--
-- Name: users; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

--
-- Name: users users_select; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY users_select ON public.users FOR SELECT USING ((app.current_user_id() IS NOT NULL));

--
-- Name: users users_write; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY users_write ON public.users USING (app.is_admin()) WITH CHECK (app.is_admin());

--
-- Name: SCHEMA app; Type: ACL; Schema: -; Owner: -
--

GRANT USAGE ON SCHEMA app TO app_user;

--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: -
--

GRANT USAGE ON SCHEMA public TO app_user;

--
-- Name: FUNCTION current_user_id(); Type: ACL; Schema: app; Owner: -
--

GRANT ALL ON FUNCTION app.current_user_id() TO app_user;

--
-- Name: FUNCTION enqueue_attachment_gc(); Type: ACL; Schema: app; Owner: -
--

REVOKE ALL ON FUNCTION app.enqueue_attachment_gc() FROM PUBLIC;

--
-- Name: FUNCTION gc_stale_attachments(older_than interval); Type: ACL; Schema: app; Owner: -
--

REVOKE ALL ON FUNCTION app.gc_stale_attachments(older_than interval) FROM PUBLIC;

--
-- Name: FUNCTION has_role(p_role text); Type: ACL; Schema: app; Owner: -
--

GRANT ALL ON FUNCTION app.has_role(p_role text) TO app_user;

--
-- Name: FUNCTION interviews_answer(p_answer_id bigint); Type: ACL; Schema: app; Owner: -
--

GRANT ALL ON FUNCTION app.interviews_answer(p_answer_id bigint) TO app_user;

--
-- Name: FUNCTION is_admin(); Type: ACL; Schema: app; Owner: -
--

GRANT ALL ON FUNCTION app.is_admin() TO app_user;

--
-- Name: FUNCTION is_answer_viewer(p_answer_id bigint); Type: ACL; Schema: app; Owner: -
--

GRANT ALL ON FUNCTION app.is_answer_viewer(p_answer_id bigint) TO app_user;

--
-- Name: FUNCTION is_stale_attachment(status integer, created_at timestamp with time zone, older_than interval); Type: ACL; Schema: app; Owner: -
--

GRANT ALL ON FUNCTION app.is_stale_attachment(status integer, created_at timestamp with time zone, older_than interval) TO app_user;

--
-- Name: FUNCTION owns_or_interviews_answer(p_answer_id bigint); Type: ACL; Schema: app; Owner: -
--

GRANT ALL ON FUNCTION app.owns_or_interviews_answer(p_answer_id bigint) TO app_user;

--
-- Name: FUNCTION uid(); Type: ACL; Schema: app; Owner: -
--

GRANT ALL ON FUNCTION app.uid() TO app_user;

--
--

--
-- Name: TABLE answer_interview_candidates; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.answer_interview_candidates TO app_user;

--
-- Name: TABLE answer_viewers; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.answer_viewers TO app_user;

--
-- Name: TABLE answers; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.answers TO app_user;

--
-- Name: SEQUENCE answers_id_seq; Type: ACL; Schema: public; Owner: -
--

GRANT USAGE ON SEQUENCE public.answers_id_seq TO app_user;

--
-- Name: TABLE attachments; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.attachments TO app_user;

--
-- Name: SEQUENCE attachments_id_seq; Type: ACL; Schema: public; Owner: -
--

GRANT USAGE ON SEQUENCE public.attachments_id_seq TO app_user;

--
-- Name: TABLE departments; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.departments TO app_user;

--
-- Name: SEQUENCE departments_id_seq; Type: ACL; Schema: public; Owner: -
--

GRANT USAGE ON SEQUENCE public.departments_id_seq TO app_user;

--
-- Name: TABLE divisions; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.divisions TO app_user;

--
-- Name: SEQUENCE divisions_id_seq; Type: ACL; Schema: public; Owner: -
--

GRANT USAGE ON SEQUENCE public.divisions_id_seq TO app_user;

--
-- Name: TABLE pg_all_foreign_keys; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.pg_all_foreign_keys TO app_user;

--
-- Name: TABLE positions; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.positions TO app_user;

--
-- Name: SEQUENCE positions_id_seq; Type: ACL; Schema: public; Owner: -
--

GRANT USAGE ON SEQUENCE public.positions_id_seq TO app_user;

--
-- Name: TABLE questions; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.questions TO app_user;

--
-- Name: SEQUENCE questions_id_seq; Type: ACL; Schema: public; Owner: -
--

GRANT USAGE ON SEQUENCE public.questions_id_seq TO app_user;

--
-- Name: TABLE schedules; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.schedules TO app_user;

--
-- Name: SEQUENCE schedules_id_seq; Type: ACL; Schema: public; Owner: -
--

GRANT USAGE ON SEQUENCE public.schedules_id_seq TO app_user;

--
-- Name: TABLE schema_migrations; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.schema_migrations TO app_user;

--
-- Name: TABLE sections; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.sections TO app_user;

--
-- Name: SEQUENCE sections_id_seq; Type: ACL; Schema: public; Owner: -
--

GRANT USAGE ON SEQUENCE public.sections_id_seq TO app_user;

--
-- Name: TABLE survey_publications; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.survey_publications TO app_user;

--
-- Name: SEQUENCE survey_publications_id_seq; Type: ACL; Schema: public; Owner: -
--

GRANT USAGE ON SEQUENCE public.survey_publications_id_seq TO app_user;

--
-- Name: TABLE survey_questions; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.survey_questions TO app_user;

--
-- Name: TABLE survey_targets; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.survey_targets TO app_user;

--
-- Name: SEQUENCE survey_targets_id_seq; Type: ACL; Schema: public; Owner: -
--

GRANT USAGE ON SEQUENCE public.survey_targets_id_seq TO app_user;

--
-- Name: TABLE surveys; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.surveys TO app_user;

--
-- Name: SEQUENCE surveys_id_seq; Type: ACL; Schema: public; Owner: -
--

GRANT USAGE ON SEQUENCE public.surveys_id_seq TO app_user;

--
-- Name: TABLE tap_funky; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.tap_funky TO app_user;

--
-- Name: TABLE urgency_levels; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.urgency_levels TO app_user;

--
-- Name: SEQUENCE urgency_levels_id_seq; Type: ACL; Schema: public; Owner: -
--

GRANT USAGE ON SEQUENCE public.urgency_levels_id_seq TO app_user;

--
-- Name: TABLE user_interview_candidates; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.user_interview_candidates TO app_user;

--
-- Name: TABLE user_roles; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.user_roles TO app_user;

--
-- Name: TABLE users; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.users TO app_user;

--
-- Name: SEQUENCE users_id_seq; Type: ACL; Schema: public; Owner: -
--

GRANT USAGE ON SEQUENCE public.users_id_seq TO app_user;

--
-- PostgreSQL database dump complete
--


-- pgmq キュー（pg_dump 対象外。実体を pgmq.create で冪等再作成）
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pgmq.list_queues() WHERE queue_name = 'attachment_gc') THEN PERFORM pgmq.create('attachment_gc'); END IF; END $$;

-- pg_cron ジョブ（pg_dump 対象外。jobname 一致で更新されるため冪等）
SELECT cron.schedule('gc-stale-attachments', '*/30 * * * *', ' SELECT app.gc_stale_attachments() ');

-- 適用済み migration の記録（snapshot 適用で schema_migrations を埋める）
INSERT INTO public.schema_migrations(version) VALUES ('0001_initial');
