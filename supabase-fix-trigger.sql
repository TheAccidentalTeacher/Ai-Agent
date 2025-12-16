-- ============================================================================
-- Fix OAuth Sign-up Issue
-- This removes the trigger that was blocking user creation
-- ============================================================================

-- Drop the trigger that creates user_preferences automatically
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Drop the function (no longer needed)
DROP FUNCTION IF EXISTS create_default_preferences();

-- Verify trigger is gone
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'on_auth_user_created'
  ) THEN
    RAISE NOTICE '✅ Trigger successfully removed';
  ELSE
    RAISE WARNING '⚠️ Trigger still exists!';
  END IF;
END $$;

-- Optional: Delete your existing user account so you can re-register
-- (Only run this if you want to start fresh)
-- 
-- DELETE FROM auth.users WHERE email = 'scosom@gmail.com';
-- 
-- RAISE NOTICE 'User account deleted - you can now sign up again';

RAISE NOTICE '';
RAISE NOTICE '🎉 Trigger removed successfully!';
RAISE NOTICE '';
RAISE NOTICE 'Next steps:';
RAISE NOTICE '1. Try signing in with GitHub OAuth again';
RAISE NOTICE '2. It should work now without the trigger blocking it';
RAISE NOTICE '3. Preferences will be created lazily when first needed';
RAISE NOTICE '';
