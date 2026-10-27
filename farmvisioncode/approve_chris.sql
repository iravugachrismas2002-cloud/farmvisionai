UPDATE "User" SET "emailVerified" = NOW(), "approvalStatus" = 'APPROVED' WHERE email = 'chrisirav537@gmail.com';
SELECT id, email, "emailVerified", "approvalStatus" FROM "User" WHERE email = 'chrisirav537@gmail.com';
