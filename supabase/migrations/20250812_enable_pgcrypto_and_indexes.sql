-- Enable pgcrypto for gen_random_uuid()
create extension if not exists pgcrypto with schema public;

-- Helpful index for media_files FK lookups
create index if not exists idx_media_files_content_item_id on media_files(content_item_id);