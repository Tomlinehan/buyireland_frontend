# Adding BuyIreland.com to Google Workspace - Step-by-Step Guide

## Overview
You'll add buyireland.com as a secondary domain to your existing Google Workspace account (currently used for Seapointclinic.ie).

**Time Required:** 30-45 minutes
**Cost:** Uses existing Google Workspace licenses
**Difficulty:** Easy

---

## Step 1: Access Google Admin Console

1. Open your browser and go to: **https://admin.google.com**

2. Sign in with your Seapointclinic.ie admin account:
   - Email: `[your-admin]@seapointclinic.ie`
   - Password: [your password]

3. You should see the **Google Admin console** dashboard

---

## Step 2: Navigate to Domains

1. In the Admin console, look for the menu on the left side

2. Click **"Account"** (might need to scroll down)

3. Click **"Domains"**

4. Click **"Manage domains"**

You'll see your current domain (seapointclinic.ie) listed here.

---

## Step 3: Add BuyIreland.com Domain

1. Click the **"Add a domain"** button (top right or center of page)

2. A dialog will appear asking you to enter the domain name:
   - Type: `buyireland.com`
   - Click **"Next"** or **"Continue"**

3. **Choose domain type:**

   You'll see two options:

   **Option A: "Secondary domain"** (RECOMMENDED)
   - Use this if you want separate users for BuyIreland
   - Example: tom@buyireland.com is different from tom@seapointclinic.ie
   - You can create different users for each company
   - Each user needs a license

   **Option B: "User alias domain"**
   - Use this if same people work at both companies
   - Example: tom@seapointclinic.ie automatically also has tom@buyireland.com
   - No additional licenses needed
   - Emails to both addresses go to same inbox

   **My recommendation:** Choose **"Secondary domain"** for more flexibility

4. Click **"Add domain and start verification"**

---

## Step 4: Verify Domain Ownership

Google needs to confirm you own buyireland.com. You'll see verification options:

### Choose "Verify with TXT record" (RECOMMENDED)

1. Google will show you a verification code that looks like:
   ```
   google-site-verification=ABC123xyz789...
   ```

2. **Keep this tab open!** You'll need to copy this code.

3. Open a new tab and go to **AWS Console**: https://console.aws.amazon.com/

4. Sign in to AWS

5. Go to **Route 53** service

6. Click **"Hosted zones"** in the left menu

7. Click on **"buyireland.com"**

---

## Step 5: Add TXT Record in AWS Route 53

Now you're in the Route 53 console for buyireland.com:

1. Click **"Create record"**

2. Fill in the following:
   ```
   Record name: [leave blank or enter @]
   Record type: TXT
   Value: [Paste the google-site-verification code from Step 4]
   TTL: 300 (5 minutes)
   Routing policy: Simple routing
   ```

3. Click **"Create records"**

4. Wait 2-5 minutes for DNS to propagate

---

## Step 6: Complete Verification in Google

1. Go back to your Google Admin Console tab

2. Click **"Verify"** or **"Verify domain"**

3. Google will check the TXT record

4. **If successful:** You'll see "Domain verified ✓"

5. **If failed:**
   - Wait 5-10 more minutes (DNS can be slow)
   - Click "Verify" again
   - Double-check you pasted the TXT record correctly

---

## Step 7: Activate Gmail for BuyIreland.com

After verification is complete:

1. You'll see a prompt: **"Activate Gmail"** or **"Set up email"**

2. Click **"Activate Gmail"** or **"Next"**

3. Google will show you the MX records you need to add

4. **IMPORTANT:** Do NOT add these yet!
   - Write them down or keep the page open
   - We'll add these in a separate step after migrating your email
   - For now, just click "I'll do this later" or skip

---

## Step 8: Create Email Users (Optional for Now)

You can create users now or later. Here's how:

1. In Admin Console, click **"Users"** in the left menu

2. Click **"Add new user"**

3. Fill in:
   ```
   First name: [e.g., Tom]
   Last name: [e.g., Linehan]
   Primary email: tom@buyireland.com
   Secondary email: [optional recovery email]
   ```

4. Choose a temporary password or auto-generate

5. Click **"Add new user"**

6. **Repeat for each user you need:**
   - info@buyireland.com
   - john@buyireland.com
   - support@buyireland.com
   - etc.

---

## Step 9: Set Up Email Aliases (Free Alternative)

If you want to save licenses, use aliases instead:

1. Go to **Users** → Select a user (e.g., tom@buyireland.com)

2. Click **"User information"** → **"Email aliases"**

3. Click **"Add alternate email"**

4. Add aliases like:
   ```
   info@buyireland.com
   support@buyireland.com
   sales@buyireland.com
   ```

5. All emails to these addresses go to tom@buyireland.com inbox

---

## ✅ What You've Accomplished So Far

At this point, you have:

- ✅ Added buyireland.com to Google Workspace
- ✅ Verified domain ownership
- ✅ Created email users or aliases
- ⏸️ Email NOT activated yet (still using WorkMail)

---

## 🚨 STOP HERE - Do Not Proceed Until Ready to Migrate

**Why stop here?**
- Your email is still working on AWS WorkMail
- You need to migrate your emails first
- Then we'll update DNS to switch to Google

---

## Next Steps (Do Later)

### Phase 2: Migrate Email from WorkMail to Google
- Export emails from WorkMail
- Import to Google Workspace
- Test email sending/receiving

### Phase 3: Update DNS Records
- Add Google's MX records to Route 53
- Remove WorkMail MX records
- Add SPF, DKIM, DMARC records

### Phase 4: Final Cutover
- Test thoroughly
- Deactivate WorkMail
- Cancel AWS WorkMail subscription

---

## 📊 Current Status Checklist

Mark what you've completed:

- [ ] Logged into Google Admin Console
- [ ] Added buyireland.com domain
- [ ] Chose domain type (Secondary or Alias)
- [ ] Copied Google verification code
- [ ] Added TXT record in Route 53
- [ ] Verified domain in Google
- [ ] Created email users or aliases
- [ ] **STOPPED before activating email**

---

## 💡 Important Notes

**Licenses:**
- Each user account needs a Google Workspace license
- Current licenses for Seapointclinic.ie can be used
- Or purchase additional licenses if needed
- Aliases are FREE (unlimited per user)

**Email Still Works:**
- Your buyireland.com email is still on WorkMail
- Nothing has changed yet
- Email continues working normally
- No interruption to service

**When to Proceed:**
- When you're ready to migrate emails
- When you have a maintenance window
- When you've backed up important emails
- Typically takes 1-2 days for full migration

---

## 🆘 Troubleshooting

### "Domain verification failed"
**Solution:**
- Wait 10-15 minutes for DNS propagation
- Check TXT record is correct in Route 53
- Remove any extra quotes or spaces
- Try verification again

### "Domain already in use"
**Solution:**
- Check if domain is in another Google Workspace
- May need to remove from old account first
- Contact Google Support if stuck

### "Can't add domain"
**Solution:**
- Ensure you're a Super Admin
- Check billing is active on Google Workspace
- Verify domain is not on a blacklist

---

## 📞 Support Resources

**Google Workspace Support:**
- Phone: 1-844-245-2553 (US)
- Chat: Available in Admin Console
- Help Center: https://support.google.com/a

**AWS Support:**
- WorkMail documentation
- Route 53 DNS help
- AWS Support tickets

---

## 📁 Files You'll Need Later

Save these for the next phase:

1. **MX Records from Google** (shown after verification)
2. **SPF Record** (Google provides)
3. **DKIM Keys** (Google provides)
4. **List of current WorkMail users** (for migration)
5. **Backup of important emails** (just in case)

---

**Ready to proceed with Phase 2 (Email Migration)?**
Let me know when you've completed Step 9 and I'll guide you through migrating your emails from WorkMail to Google!

---

*Last Updated: 2026-01-02*
*Created by: Claude Code*
