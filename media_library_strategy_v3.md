# Media Library & Member Upload Strategy (v3)
**Lou Gehrig Fan Club – Website & Content Management**

> **What’s new in v3:** Added **rclone OAuth setup instructions** for Google Drive with `RCLONE_CONF` secret. This lets GitHub Actions workflows have full **read/write/delete** on Drive without a service account.

---

## 1. Stable Identity Model

- `asset_id (UUID v4)` as primary key.  
- `media_blobs` table keyed by `sha256`.  
- `media_assets` table keyed by `asset_id`, referencing blobs.  
- Members always get their own asset, even if duplicate.  
- Blobs reused in B2 storage for cost control.

---

## 2. Tables & Constraints

### `media_blobs`
```sql
CREATE TABLE media_blobs (
  sha256 text PRIMARY KEY,
  b2_key text NOT NULL,
  size bigint NOT NULL,
  mime text NOT NULL,
  created_at timestamptz DEFAULT now(),
  canonical_asset_id uuid NULL
);
```

### `media_assets`
```sql
CREATE TABLE media_assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  blob_sha256 text NOT NULL REFERENCES media_blobs(sha256),
  visual_hash text,
  capture_datetime timestamptz,
  capture_year int,
  original_filename text,
  provenance jsonb,
  uploader_user_id uuid,
  is_public boolean DEFAULT false,
  moderation_status text DEFAULT 'pending' CHECK (
    moderation_status IN ('pending','approved','rejected','blocked')
  ),
  is_library boolean DEFAULT false,
  exif jsonb,
  created_at timestamptz DEFAULT now()
);
```

### Constraints
```sql
-- Only one library copy per blob
CREATE UNIQUE INDEX one_library_copy_per_blob
ON media_assets (blob_sha256)
WHERE is_library = true;

-- Prevent the same member from spamming identical blobs
CREATE UNIQUE INDEX one_member_asset_per_blob
ON media_assets (blob_sha256, uploader_user_id)
WHERE is_library = false;
```

Supporting tables: `media_tags`, `media_subjects`, `post_media`, `audit_log`.

---

## 3. Ingest Workflow

Steps: hash → blob check → asset creation → tagging → moderation.  
Always create new asset for member uploads, reuse blobs for storage efficiency.  

---

## 4. Library vs. Member Copies

- Library copy: one per blob, public, approved.  
- Member copies: personal uploads, always credited, searchable, may be public if approved.  

---

## 5. Moderation

- Pre-moderation default.  
- Approve, Reject, Block, Promote-to-Library actions.  
- Audit log for all moderator actions.  

---

## 6. Search & Browse

- Members: see their own uploads.  
- Public: see only library copies.  
- Combined toggle possible.  
- Indexing with GIN/trigram, optional vector search.  

---

## 7. Posts & Content Creation

- Single “Create Post” page for admins + members.  
- Attach media from library or new upload.  
- Posts linked via `post_media`.  

---

## 8. Deletion & Undo

- Soft delete posts.  
- Toggle visibility on assets.  
- Never hard-delete blobs by default.  

---

## 9. UI & UX Notes

- Member upload confirmation messages.  
- Duplicate detection messaging.  
- Moderation dashboard features.  

---

## 10. Technical Highlights

- UUID for stable IDs.  
- SHA256 + visual hash for dedupe/versioning.  
- Blobs reused in B2.  
- Supabase RLS for access control.  
- Indexes for performance.  

---

## 11. Drive Sweeper Archive

After successful ingest, move processed files into `archive/` in Drive:  

**Markdown example:**  
```yaml
rclone mkdir gdrive_md:archive || true
rclone move gdrive_md: gdrive_md:archive --include "*.md" --ignore-existing --create-empty-src-dirs
```

**Media example:**  
```yaml
rclone mkdir gdrive_media:archive || true
rclone move gdrive_media: gdrive_media:archive   --include "*.jpg" --include "*.jpeg" --include "*.png" --include "*.gif"   --include "*.tif" --include "*.tiff" --include "*.webp"   --include "*.mp4" --include "*.mov" --include "*.avi" --include "*.mkv"   --ignore-existing --create-empty-src-dirs
```

---

## 12. rclone OAuth Setup (for RCLONE_CONF secret)

This avoids creating a Service Account. We use your own Google account via OAuth.  

### Steps

1. **Install rclone**  
   - macOS: `brew install rclone`  
   - Linux: download from [https://rclone.org/downloads/](https://rclone.org/downloads/)

2. **Run OAuth authorization**  
   ```bash
   rclone authorize "drive"
   ```
   - This opens a Google consent screen in your browser.  
   - Sign in with the account that owns the shared folder.  
   - Approve access.  

3. **Copy the token JSON**  
   - rclone prints a JSON blob like:  
     ```json
     {"access_token":"ya29...","token_type":"Bearer","refresh_token":"1//0g...","expiry":"2025-09-08T12:34:56.789Z"}
     ```

4. **Create rclone.conf content**  
   Paste into a file:  
   ```
   [gdrive]
   type = drive
   scope = drive
   token = {"access_token":"ya29...","token_type":"Bearer","refresh_token":"1//0g...","expiry":"2025-09-08T12:34:56.789Z"}
   root_folder_id = 1cC5I5lVQj1xfeXecBpPr_AvCRmkSIuuJ
   ```

5. **Add to GitHub Secrets**  
   - Go to your repo → Settings → Secrets and variables → Actions.  
   - Create a secret named `RCLONE_CONF`.  
   - Paste the **entire contents** of the above file (section header `[gdrive]` + all lines).  

6. **Run Workflow**  
   - Trigger via “Actions → Drive Sync (OAuth)” → choose `pull` or `push`.  
   - For ingest: `pull` with `include=*.md` and `archive=true`.  
   - To overwrite Drive: `push` with your desired glob.

---
