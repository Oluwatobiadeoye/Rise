// Creates (or updates) the public `blog` storage bucket in Supabase. Idempotent
// and safe to re-run. Requires SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.
//
//   npm run setup-blog-bucket

import { createClient } from "@supabase/supabase-js";

const BUCKET = "blog";
const MAX_BYTES = 8 * 1024 * 1024;
const MIME = ["image/jpeg", "image/png", "image/webp"];

async function main() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set.");
  }

  const supabase = createClient(url, key, {
    auth: { persistSession: false },
  });

  const options = {
    public: true,
    fileSizeLimit: MAX_BYTES,
    allowedMimeTypes: MIME,
  };

  const { error: createError } = await supabase.storage.createBucket(
    BUCKET,
    options,
  );

  if (createError) {
    // Already exists -> bring its settings in line instead of failing.
    const { error: updateError } = await supabase.storage.updateBucket(
      BUCKET,
      options,
    );
    if (updateError) throw updateError;
    console.log(`Bucket "${BUCKET}" already existed; settings updated.`);
  } else {
    console.log(`Created public bucket "${BUCKET}".`);
  }
  console.log(
    `Public, ${MAX_BYTES / 1024 / 1024} MB limit, MIME: ${MIME.join(", ")}.`,
  );
}

main().catch((error) => {
  console.error(`\nFailed: ${error.message}`);
  process.exitCode = 1;
});
