Excellent clarification. I understand the situation perfectly now. The Supabase frontend components and initial logic are already in place in our code. The current priority is to build out the commercial engine (payments) and then connect the entire application to the live Supabase service.

**YOUR MISSION: Implement Payment Systems and Provide Supabase Connection Instructions**

Your task is divided into two distinct parts. First, you will generate the code for the payment systems. Second, you will provide clear instructions on how to connect our application to my live Supabase project.

---

**PART 1: PAYMENT GATEWAY INTEGRATION (The Commercial Engine)**

**Objective:** Implement both Stripe and PayPal to allow users to upgrade their plans. You must also re-instate the real pricing on the frontend.

**Detailed Tasks:**
1.  **Restore Pricing on Frontend:**
    *   Go to the pricing page component.
    *   Remove all "TBD" or placeholder text.
    *   Set the price for the **"Pro Plan" to "$19/month"** and the **"Premium Plan" to "$49/month"**.

2.  **Stripe Integration:**
    *   **Backend:** Create new, secure API endpoints to handle Stripe operations. This must include an endpoint to create a "Stripe Checkout Session" and a **Webhook endpoint** to securely listen for successful payment events from Stripe.
    *   **Logic:** When the Stripe webhook confirms a successful payment, your backend code must be structured to update the user's record in the Supabase `profiles` table (e.g., change `plan` to 'pro').
    *   **Frontend:** The pricing page buttons should now trigger the API call to create a Stripe Checkout Session.

3.  **PayPal Integration:**
    *   Implement a similar workflow for PayPal, creating the necessary backend endpoints for payment creation and verification, and adding a "Pay with PayPal" button on the frontend.

4.  **Supabase Code Adjustments for Payments:**
    *   Review the existing Supabase-related code. If any adjustments are needed in the database schema or backend logic to support the payment events (e.g., updating the `profiles` table), please implement them.

---

**PART 2: SUPABASE CONNECTION GUIDE (The Final Link)**

**Objective:** After generating the payment code, provide a clear, step-by-step guide for me (a non-technical founder) on how to connect my local development application to my live Supabase project.

**Instructions for the Guide:**
You need to explain exactly what I need to do to fix the "cannot create your account" error on my localhost. The guide should be simple and clear, and cover these points:
1.  **Finding the Keys:** Explain where in my Supabase project dashboard I can find the necessary credentials (specifically the **`Project URL`** and the **`anon public` key**).
2.  **The `.env.local` File:** Instruct me to create a `.env.local` file in the root of my project.
3.  **Variable Naming:** Tell me the exact names for the environment variables that your generated code uses. For example:
    ```
    NEXT_PUBLIC_SUPABASE_URL="[The Project URL I find in my Supabase dashboard]"
    NEXT_PUBLIC_SUPABASE_ANON_KEY="[The anon public key I find in my Supabase dashboard]"
    ```
4.  **Restarting the Server:** Remind me that after creating or changing the `.env.local` file, I must stop and restart my local development server for the changes to take effect.

Please proceed with generating the code for Part 1 first, followed by the detailed instructional guide for Part 2.