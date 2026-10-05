-- ================================================================
-- Supabase: seeds da landing page internacional (/international)
-- ----------------------------------------------------------------
-- Idempotente: pode rodar mais de uma vez sem erro e sem sobrescrever
-- textos que o admin já tenha editado (ON CONFLICT DO NOTHING).
--
-- Execute no SQL Editor do Supabase (Dashboard > SQL Editor).
-- Requer a tabela public.page_contents (migrations_v2_sections_seo.sql).
-- ================================================================

create extension if not exists "pgcrypto";

-- Garante as colunas usadas pelos campos da landing internacional.
alter table public.page_contents
  add column if not exists subtitle text,
  add column if not exists quote_text text,
  add column if not exists button_primary_label text,
  add column if not exists button_primary_url text,
  add column if not exists button_secondary_label text,
  add column if not exists button_secondary_url text,
  add column if not exists image_url text;

-- 1) Hero
insert into public.page_contents
  (section_key, badge_text, title, subtitle, quote_text,
   button_primary_label, button_primary_url,
   button_secondary_label, button_secondary_url, image_url)
values (
  'intl_hero',
  'INTERNATIONAL CLIENTS',
  E'Protect your IP.\nEnter the Brazilian market.\nBuild innovation partnerships.',
  'Strategic legal and innovation support for foreign companies and international law firms navigating intellectual property, technology transfer and innovation opportunities in Brazil.',
  'Based in Brazil. Working across borders.',
  'Talk to Bianca', '#contact',
  'Explore our services', '#services',
  ''
)
on conflict (section_key) do nothing;

-- 2) Trust bar
insert into public.page_contents (section_key, badge_text, title, description)
values (
  'intl_trust', 'HOW WE HELP',
  'Three ways we support international clients',
  'A focused practice built around intellectual property, market entry and innovation — delivered by a Brazilian team for clients working across jurisdictions.'
)
on conflict (section_key) do nothing;

-- 3) Services overview
insert into public.page_contents (section_key, badge_text, title, description)
values (
  'intl_services', 'SERVICES',
  'How we can support your business in Brazil',
  'Entering a new market requires more than local knowledge. It requires a strategic understanding of how intellectual property, contracts, regulation and innovation interact.'
)
on conflict (section_key) do nothing;

-- 4) IP Protection
insert into public.page_contents
  (section_key, badge_text, title, description,
   button_primary_label, button_primary_url)
values (
  'intl_ip', 'INTELLECTUAL PROPERTY',
  'Protect your intellectual property in Brazil',
  'Brazil is one of the world''s major markets. Protecting your brand, technology and other intellectual assets locally should be part of your market-entry strategy.',
  'Protect your IP in Brazil', '#contact'
)
on conflict (section_key) do nothing;

-- 5) Brazil Market Entry
insert into public.page_contents
  (section_key, badge_text, title, description,
   button_primary_label, button_primary_url)
values (
  'intl_market_entry', 'BRAZIL MARKET ENTRY',
  'Entering the Brazilian market?',
  'Brazil offers significant commercial and innovation opportunities, but navigating its legal, intellectual property and regulatory environment requires local expertise.',
  'Discuss your Brazil market entry', '#contact'
)
on conflict (section_key) do nothing;

-- 6) Innovation & Technology Transfer
insert into public.page_contents
  (section_key, badge_text, title, description,
   button_primary_label, button_primary_url)
values (
  'intl_innovation', 'INNOVATION & TECHNOLOGY TRANSFER',
  'Build innovation partnerships in Brazil',
  'Brazil has a diverse innovation ecosystem connecting companies, universities, research institutions, startups and technology-based organizations. We support companies seeking to establish or structure these relationships.',
  'Discuss an innovation project', '#contact'
)
on conflict (section_key) do nothing;

-- 7) International Law Firms
insert into public.page_contents
  (section_key, badge_text, title, description, subtitle, quote_text,
   button_primary_label, button_primary_url)
values (
  'intl_law_firms', 'FOR INTERNATIONAL LAW FIRMS',
  'Looking for Brazilian IP support for your clients?',
  'We work with international law firms and intellectual property professionals that need reliable Brazilian support for their clients.',
  'A reliable Brazilian partner for your international practice.',
  'Confidentiality, responsiveness and clear communication are central to our international work.',
  'Discuss a partnership', '#contact'
)
on conflict (section_key) do nothing;

-- 8) Why Bianca
insert into public.page_contents (section_key, badge_text, title, description)
values (
  'intl_why', 'WHY BIANCA',
  'Why work with Bianca?',
  'A single point of contact combining Brazilian legal expertise, business sense and cross-border communication.'
)
on conflict (section_key) do nothing;

-- 9) How we work
insert into public.page_contents (section_key, badge_text, title, description)
values (
  'intl_process', 'HOW WE WORK',
  'A clear process for international clients',
  'A structured path from first conversation to implementation — you always know where you are and what comes next.'
)
on conflict (section_key) do nothing;

-- 10) About
insert into public.page_contents
  (section_key, badge_text, title, description, image_url)
values (
  'intl_about', 'ABOUT',
  'Brazilian expertise. International perspective.',
  'Bianca Martins is a Brazilian lawyer and consultant focused on Intellectual Property, Innovation and Technology Transfer. Her practice sits at the intersection of legal strategy, innovation ecosystems, intellectual property and technology partnerships. She supports companies and organizations dealing with the Brazilian market, helping them protect intellectual assets, structure strategic relationships and navigate innovation opportunities.',
  '/images/bianca-martins.jpg'
)
on conflict (section_key) do nothing;

-- 11) FAQ
insert into public.page_contents (section_key, badge_text, title, description)
values (
  'intl_faq', 'FAQ',
  'Questions from international clients',
  'Common questions about protecting and commercializing intellectual property and building innovation partnerships in Brazil.'
)
on conflict (section_key) do nothing;

-- 12) CTA final
insert into public.page_contents
  (section_key, badge_text, title, description,
   button_primary_label, button_primary_url,
   button_secondary_label, button_secondary_url)
values (
  'intl_cta', 'NEXT STEP',
  'Planning to enter or expand in Brazil?',
  'Let''s discuss your intellectual property, market-entry or innovation needs.',
  'Talk to Bianca', '#contact',
  'Send an inquiry', '#contact'
)
on conflict (section_key) do nothing;
