--
-- PostgreSQL database dump
--

\restrict ZkLqsLSLam7lKyjFXCHjWl1cmXae9jbPl8nqWRu5VI40YfSrpldwd97NL2UyZ0S

-- Dumped from database version 18.3 (Debian 18.3-1+b1)
-- Dumped by pg_dump version 18.3 (Debian 18.3-1+b1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: people; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.people VALUES (1, '30409021500437', 'مصطفي', 'راضي محمد حسن', '01064020569', '2026-03-01 01:59:16.891829+02');


--
-- Data for Name: posts; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.posts VALUES (1, 1, NULL, 1, 'شكوى', 'نمؤشىةئمةىئميمىئمىئىمىىئؤمىؤئىمئىمىؤىؤئى', 'دسوق', '2026-03-01 01:59:16.891829+02');


--
-- Data for Name: attachments; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Name: attachments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.attachments_id_seq', 1, false);


--
-- Name: people_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.people_id_seq', 1, true);


--
-- Name: posts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.posts_id_seq', 1, true);


--
-- PostgreSQL database dump complete
--

\unrestrict ZkLqsLSLam7lKyjFXCHjWl1cmXae9jbPl8nqWRu5VI40YfSrpldwd97NL2UyZ0S

