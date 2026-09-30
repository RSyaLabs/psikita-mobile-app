--
-- PostgreSQL database dump
--

\restrict f0Pi8ov8IpkpIKKzSPXxhEAy0e8aZfIPcG5aYrhyZs9Xtk4lXFoiA1HoN1Z4E1a

-- Dumped from database version 16.15
-- Dumped by pg_dump version 16.15

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
-- Data for Name: users; Type: TABLE DATA; Schema: iam; Owner: psikita
--

INSERT INTO iam.users VALUES ('01M34M0WMG1S8ZPP8BAPZ10BWW', 'ADMIN_LOCAL', 'admin@psikita.com', 'ADMIN', '[{"action": "manage", "subject": "all"}, {"action": "manage", "subject": "Practitioner"}, {"action": "read", "subject": "Practitioner"}, {"action": "manage", "subject": "PractitionerProfile"}, {"action": "read", "subject": "PractitionerProfile"}, {"action": "manage", "subject": "Patient"}]', true);
INSERT INTO iam.users VALUES ('01M34MQZ30P5GE757D3178RB4W', 'dr_rina_amelia', 'rina.amelia@psikita.com', 'PSYCHOLOGIST', '[{"action": "manage", "subject": "Practitioner"}, {"action": "read", "subject": "Practitioner"}, {"action": "manage", "subject": "PractitionerProfile"}, {"action": "read", "subject": "PractitionerProfile"}, {"action": "manage", "subject": "Consultation"}, {"action": "read", "subject": "Patient"}]', true);
INSERT INTO iam.users VALUES ('01M34MQZ3069AHXD42BZVDWTP7', 'dr_andi_pratama', 'andi.pratama@psikita.com', 'PSYCHIATRIST', '[{"action": "manage", "subject": "Practitioner"}, {"action": "read", "subject": "Practitioner"}, {"action": "manage", "subject": "PractitionerProfile"}, {"action": "read", "subject": "PractitionerProfile"}, {"action": "manage", "subject": "Consultation"}, {"action": "read", "subject": "Patient"}]', true);
INSERT INTO iam.users VALUES ('01M34MQZ30KNDH4PAKMS9R3DHH', 'siti_rahayu', 'siti.rahayu@psikita.com', 'USER', '[{"action": "read", "subject": "Practitioner"}, {"action": "read", "subject": "PractitionerProfile"}, {"action": "read", "subject": "Patient"}]', true);


--
-- Data for Name: auth_methods; Type: TABLE DATA; Schema: iam; Owner: psikita
--

INSERT INTO iam.auth_methods VALUES ('01M34M0WMGWPQNPSZ9GVCYGNNR', 'PASSWORD', '{"type": "PASSWORD", "password": "$2b$10$1vzIAgxb9sdvpS1L4o31Uuiio82iYZRBug7YsB7IQxGlBzCDg9AWa"}', '01M34M0WMG1S8ZPP8BAPZ10BWW');
INSERT INTO iam.auth_methods VALUES ('01M34MQZ30FCRZD9J3Z8PSW7Y6', 'PASSWORD', '{"type": "PASSWORD", "password": "$2b$10$1vzIAgxb9sdvpS1L4o31Uuiio82iYZRBug7YsB7IQxGlBzCDg9AWa"}', '01M34MQZ30KNDH4PAKMS9R3DHH');
INSERT INTO iam.auth_methods VALUES ('01M34MQZ30J7DVCXA0CXGG1566', 'PASSWORD', '{"type": "PASSWORD", "password": "$2b$10$1vzIAgxb9sdvpS1L4o31Uuiio82iYZRBug7YsB7IQxGlBzCDg9AWa"}', '01M34MQZ30P5GE757D3178RB4W');
INSERT INTO iam.auth_methods VALUES ('01M34MQZ300B399V1XVG9DT6B4', 'PASSWORD', '{"type": "PASSWORD", "password": "$2b$10$1vzIAgxb9sdvpS1L4o31Uuiio82iYZRBug7YsB7IQxGlBzCDg9AWa"}', '01M34MQZ3069AHXD42BZVDWTP7');


--
-- Data for Name: pricing_phases; Type: TABLE DATA; Schema: public; Owner: psikita
--

INSERT INTO public.pricing_phases VALUES ('01M34MQZ308DMEY8AZN48J6WYY', 'Fase Standar 2026', true, '2026-09-22 13:26:40.763536+00', '2026-09-22 13:26:40.763536+00');


--
-- Data for Name: master_session_rates; Type: TABLE DATA; Schema: public; Owner: psikita
--

INSERT INTO public.master_session_rates VALUES ('01M34MQZ30P27RN5SNFFJG4Z2F', '01M34MQZ308DMEY8AZN48J6WYY', 'PSYCHOLOGIST', 1, 150000, '2026-09-22 13:26:40.765286+00', '2026-09-22 13:26:40.765286+00', 45, 'BASE');
INSERT INTO public.master_session_rates VALUES ('01M34MQZ306WYMR76SQGCYMPW6', '01M34MQZ308DMEY8AZN48J6WYY', 'PSYCHIATRIST', 1, 250000, '2026-09-22 13:26:40.765286+00', '2026-09-22 13:26:40.765286+00', 45, 'BASE');


--
-- Data for Name: matching_requests; Type: TABLE DATA; Schema: public; Owner: psikita
--

INSERT INTO public.matching_requests VALUES ('01M34MVA6HMC1JBMMKZRGMDAP6', '01M34MQZ30KNDH4PAKMS9R3DHH', '01M34MVA6A59054M6M79EQZA4D', 'level_2', 'WAITING_ROOM', '[]', NULL, NULL, NULL, NULL, '2026-09-22 13:28:25.041+00', '2026-09-22 13:28:25.05+00');
INSERT INTO public.matching_requests VALUES ('01M34N96KM9TX95DBB53CDR7S9', '01M34MQZ30KNDH4PAKMS9R3DHH', '01M34N96KBYQ6YM4YHF5SG8ZXS', 'level_2', 'WAITING_ROOM', '[]', NULL, NULL, NULL, NULL, '2026-09-22 13:36:00.116+00', '2026-09-22 13:36:00.118+00');


--
-- Data for Name: patients; Type: TABLE DATA; Schema: public; Owner: psikita
--

INSERT INTO public.patients VALUES ('01M34MQZ30KNDH4PAKMS9R3DHH', 'YpNK8eMk6e/Vq42wxKqbqn+a1ICNq2vJFx+L63VgnzWxBXPopk11', '8Ut+7ZAa1XWbL0mQ6Uz1uEzDjwO26P2VkRapVKwbaI7a1WWy80HUvWK67bztU4iLrhknbg==', 'Dqrrj5LYg9Rjq8J4qMzrg67UMgM5VQrsIxgmsjoqIHZ/SzIwLKI/YMrA1B8=', 'RA0YiVa6koA5aHq7MjZthdXQYzRksy7iERyUJEPglca7Q22ucxaFJA==', 'KGG/x/8nxpkMVCgIUBYnW8BAWd8ZDjK8gOkVGcAW/9MJQd9pJwVu5sn96kc0BTRdo4sZtu6X5JMXhdxJC/lLlAX7', 'LhZjpEM6AH3/iHHMFZZrPVLI8Zj2N/mAyyz4kelnLvmD6Tlig+b6MA==', 'FEMALE', '5b5ba58fc13412d6981c601ccc4aea6a009da3a4245f7dd675a86c02d0103c38', '385bc0c362dfd3cd8cce4aea8dca8feca447d04e07c7185423cf3148c4d4645b', '19f9723ab76b4931ab8f223e1f3e775900c51e04a11e70cd408bc131bc6d5bdb', '2026-09-22 13:28:08.91+00', '2026-09-22 13:28:08.91+00', 'PENDING_MANUAL_REVIEW', NULL, 'DUKCAPIL_DISABLED');


--
-- Data for Name: posts; Type: TABLE DATA; Schema: public; Owner: psikita
--

INSERT INTO public.posts VALUES ('01M34MQZ30E1EZF8V3E7NKNNBN', '01M34MQZ30P5GE757D3178RB4W', 'Mengenal Overthinking: Gejala, Dampak, dan Cara Mengatasinya dengan Mindful Breathing #KesehatanMental', NULL, '2026-09-22 13:26:40.783954+00', NULL);
INSERT INTO public.posts VALUES ('01M34MQZ304BSE8FYGPX2APK9F', '01M34MQZ3069AHXD42BZVDWTP7', 'Pentingnya Konsultasi Dini saat Mengalami Gangguan Tidur Kronis dan Kecemasan Berkepanjangan #TipsPsikiatri', NULL, '2026-09-22 13:26:40.783954+00', NULL);


--
-- Data for Name: practitioners; Type: TABLE DATA; Schema: public; Owner: psikita
--

INSERT INTO public.practitioners VALUES ('01M34NN3EC48KSA78QGJCN9Z4S', '01M34MQZ3069AHXD42BZVDWTP7', 'PSYCHIATRIST', 'vS/D8X1xhYoA/uiTM6w74N76bpjaRp9Ed8G8C5ZKmeMBhzihGgKbIfrBew==', 'lDh4jgm9rRo+wiGINqOqkDpjo08nhn7Iyb0sh5a6Cs1sJ0bEyk+jdIlFCrs=', 'INACTIVE', 0, '2026-09-22 13:42:30.093+00', '2026-09-22 13:42:30.093+00', '01M34NN3EC48KSA78QGJCN9Z4S', NULL, 'PENDING', NULL, 'MANUAL_REVIEW', NULL, 'DUKCAPIL_DISABLED');
INSERT INTO public.practitioners VALUES ('01M34NSCFRV8SKNE3XNYA1RR43', '01M34MQZ30P5GE757D3178RB4W', 'PSYCHOLOGIST', 'BIwtKLLvlQfuFgLyF9DYqDnVKxlRi9ZBdZDRkwH5ZXBKQq6JZ3oOu2+Uhg==', 'LM+iiI8NcrcsoiKumqBsHl2WpvGHyF8YocbK60eVw8L1qnxWJSdtXu+QTZY=', 'INACTIVE', 0, '2026-09-22 13:44:50.426+00', '2026-09-22 13:44:50.426+00', NULL, '01M34NSCFRV8SKNE3XNYA1RR43', 'PENDING', NULL, 'MANUAL_REVIEW', NULL, 'DUKCAPIL_DISABLED');


--
-- Data for Name: practitioner_educations; Type: TABLE DATA; Schema: public; Owner: psikita
--

INSERT INTO public.practitioner_educations VALUES ('01M34NN3EBX9ZE8T0TZGHVY2P6', '01M34NN3EC48KSA78QGJCN9Z4S', 'Universitas Airlangga', 'Sp.KJ', 'Kedokteran Jiwa', 2011);
INSERT INTO public.practitioner_educations VALUES ('01M34NSCFQCP7A905DX5QZDA8C', '01M34NSCFRV8SKNE3XNYA1RR43', 'Universitas Indonesia', 'S2', 'Psikologi Klinis', 2012);


--
-- Data for Name: practitioner_experiences; Type: TABLE DATA; Schema: public; Owner: psikita
--

INSERT INTO public.practitioner_experiences VALUES ('01M34NN3EC63QCPSP7HZ26MHBJ', '01M34NN3EC48KSA78QGJCN9Z4S', 'RSUP Cipto Mangunkusumo', 'Dokter Spesialis Kejiwaan', '2013-01-01 00:00:00+00', '2024-01-01 00:00:00+00');
INSERT INTO public.practitioner_experiences VALUES ('01M34NSCFQMGKZ2XNV5Z5CJPKH', '01M34NSCFRV8SKNE3XNYA1RR43', 'RS Jiwa Soeharto Heerdjan', 'Psikolog Klinis', '2015-01-01 00:00:00+00', '2024-01-01 00:00:00+00');


--
-- Data for Name: psychiatrist_profiles; Type: TABLE DATA; Schema: public; Owner: psikita
--

INSERT INTO public.psychiatrist_profiles VALUES ('01M34NN3EC48KSA78QGJCN9Z4S', '01M34NN3EC48KSA78QGJCN9Z4S', 'vyoEKszOeCPodx6hftBX4yfmjuB2qN4FJUp8zKYjPZqu8DvsHl3ukJ/IRbXP9A==', 'U+M4l3x+v6HDWGPo6BIG21zMY3VLU8apRw9Vtk1tQWurjS6YipZ9sjwYHrnrXg==', true, '2026-09-22 13:42:30.093+00', '2026-09-22 13:42:30.093+00');


--
-- Data for Name: psychologist_profiles; Type: TABLE DATA; Schema: public; Owner: psikita
--

INSERT INTO public.psychologist_profiles VALUES ('01M34NSCFRV8SKNE3XNYA1RR43', '01M34NSCFRV8SKNE3XNYA1RR43', 'X5Jz4FQdfc2y0Shvke8aPyoFGlFf6F5eZc14QeV4Oewr3d6blsBRfht6IYNenJKGcf327g==', '', 'level_1', 0, false, '2026-09-22T13:44:50.426Z', '2026-09-22T13:44:50.426Z');


--
-- Data for Name: triage_records; Type: TABLE DATA; Schema: public; Owner: psikita
--

INSERT INTO public.triage_records VALUES ('01M34MVA6A59054M6M79EQZA4D', '01M34MQZ30KNDH4PAKMS9R3DHH', '01M34MQZ30KNDH4PAKMS9R3DHH', 'SELF_ASSESSMENT', 14, false, 'YELLOW', 'PENDING', 'Kecemasan berlebih dan gangguan tidur selama 2 minggu', '{"q1": "sering", "q2": "kadang", "q3": "selalu"}', '2026-09-22 13:28:25.034+00', '2026-09-22 13:28:25.034+00');
INSERT INTO public.triage_records VALUES ('01M34N96KBYQ6YM4YHF5SG8ZXS', '01M34MQZ30KNDH4PAKMS9R3DHH', '01M34MQZ30KNDH4PAKMS9R3DHH', 'SELF_ASSESSMENT', 14, false, 'YELLOW', 'PENDING', 'Keluhan kecemasan dan insomnia', '{"q1": "Sering cemas", "q2": "Sulit tidur"}', '2026-09-22 13:36:00.107+00', '2026-09-22 13:36:00.107+00');


--
-- PostgreSQL database dump complete
--

\unrestrict f0Pi8ov8IpkpIKKzSPXxhEAy0e8aZfIPcG5aYrhyZs9Xtk4lXFoiA1HoN1Z4E1a

