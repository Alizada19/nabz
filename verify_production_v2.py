import os
from playwright.sync_api import sync_playwright

def run_verification():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()
        page = context.new_page()

        # 1. Register Screen
        print("Navigating to register page...")
        page.goto("http://127.0.0.1:3006/register")
        page.wait_for_timeout(3000)
        register_screenshot = "/home/jules/verification/register_flow.png"
        page.screenshot(path=register_screenshot)
        print(f"Register screenshot taken at: {register_screenshot}")

        # 2. Register a new individual donor
        print("Registering new individual donor...")
        page.fill("input[name='name']", "Test Donor")
        page.fill("input[name='email']", "testdonor2026_final_v1@example.com")
        page.fill("input[name='phone']", "+60123456781")
        page.fill("input[name='password']", "SecurePassword123!")

        # Select role 'donor' using select selector
        page.select_option("select[name='role']", "donor")
        page.wait_for_timeout(500)

        # Select blood type 'O-'
        page.select_option("select[name='bloodType']", "O-")
        page.wait_for_timeout(500)

        # Fill location details
        page.fill("input[name='location']", "Kuala Lumpur, Malaysia")

        # Submit register
        page.click("button[type='submit']")
        page.wait_for_timeout(4000) # Wait for API response & login redirect

        # Screenshot the Donor Dashboard
        donor_dashboard_screenshot = "/home/jules/verification/donor_dashboard_flow.png"
        page.screenshot(path=donor_dashboard_screenshot)
        print(f"Donor Dashboard screenshot taken at: {donor_dashboard_screenshot}")

        # 3. Create a Seeker account
        print("Opening new context to register seeker...")
        context2 = browser.new_context()
        page2 = context2.new_page()
        page2.goto("http://127.0.0.1:3006/register")
        page2.wait_for_timeout(2000)

        print("Registering new seeker...")
        page2.fill("input[name='name']", "Test Seeker")
        page2.fill("input[name='email']", "testseeker2026_final_v1@example.com")
        page2.fill("input[name='phone']", "+60123456782")
        page2.fill("input[name='password']", "SecurePassword123!")

        page2.select_option("select[name='role']", "seeker")
        page2.wait_for_timeout(500)

        page2.fill("input[name='location']", "Kuala Lumpur, Malaysia")
        page2.click("button[type='submit']")
        page2.wait_for_timeout(4000)

        # Screenshot the Seeker Dashboard (containing the fast request form)
        seeker_dashboard_screenshot = "/home/jules/verification/seeker_dashboard_flow.png"
        page2.screenshot(path=seeker_dashboard_screenshot)
        print(f"Seeker Dashboard screenshot taken at: {seeker_dashboard_screenshot}")

        browser.close()

if __name__ == "__main__":
    run_verification()
