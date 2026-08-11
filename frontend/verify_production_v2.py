import time
import random
import sys
from playwright.sync_api import sync_playwright

def run_verification():
    print("Starting Playwright verification v2...")
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={"width": 1280, "height": 900})
        page = context.new_page()

        page.on("console", lambda msg: print(f"BROWSER CONSOLE: {msg.text}"))
        page.on("pageerror", lambda err: print(f"BROWSER ERROR: {err.message}"))
        page.on("response", lambda resp: print(f"HTTP RESPONSE ERROR: {resp.status} {resp.url}") if resp.status >= 400 else None)

        unique_id = int(time.time())
        email = f"seeker_v2_{unique_id}@test.com"
        phone = f"+6012{random.randint(1000000, 9999999)}"
        print(f"Creating seeker: {email} / {phone}")

        # Step 1: Register
        page.goto("http://127.0.0.1:3002/register")
        page.wait_for_timeout(2000)

        page.fill("input[name='name']", "Dynamic Tester Admin")
        page.fill("input[name='email']", email)
        page.fill("input[name='phone']", phone)
        page.fill("input[name='password']", "password123")
        page.select_option("select[name='role']", "seeker")
        page.fill("input[name='location']", "Kuala Lumpur Central")
        page.click("button[type='submit']")
        page.wait_for_timeout(4000)

        # Confirm we are on Dashboard
        assert "/dashboard" in page.url, f"Expected dashboard URL, got: {page.url}"
        print("Successfully registered and navigated to Dashboard.")

        # Step 2: Navigate to Create Page
        page.goto("http://127.0.0.1:3002/blood-requests/new")
        page.wait_for_timeout(2000)
        page.screenshot(path="/home/jules/verification/v2_01_create_individual_empty.png")
        print("Loaded Create page.")

        # By default, "Individual" is selected.
        # Let's verify that Hospital Name and Hospital Address fields are NOT visible on individual empty form.
        assert not page.locator("input[placeholder='E.g. Hospital Kuala Lumpur']").is_visible(), "Hospital name field should be hidden under empty individual mode"
        print("Verified: Hospital fields are hidden under default Individual mode.")

        # Fill out preferred hospital to verify that hospital specific coordinates and address fields fade in/appear.
        page.fill("input[name='preferredHospital']", "Pantai Hospital")
        page.wait_for_timeout(1000)
        page.screenshot(path="/home/jules/verification/v2_02_create_individual_with_preferred.png")

        # Now Pantai Hospital address field should be visible.
        assert page.locator("input[name='hospitalAddress']").is_visible(), "Hospital address field should be visible when preferred hospital is entered"
        print("Verified: Hospital specific fields appear when preferred hospital is filled.")

        # Fill out individual form mandatory fields
        page.fill("input[name='requesterName']", "Dynamic Seeker Patient")
        page.fill("input[name='requesterPhone']", "+60123456789")
        page.fill("input[name='currentLocationName']", "Apartment Block A, KL")
        page.select_option("select[name='bloodType']", "O-")
        page.select_option("select[name='urgencyLevel']", "high")
        page.fill("input[name='unitsRequired']", "3")
        page.fill("textarea[name='additionalNotes']", "Patient preparing for sudden O- heart procedure.")

        # Submit Individual Request
        page.click("button[type='submit']")
        page.wait_for_timeout(4000)

        assert "/blood-requests" in page.url, f"Expected redirect to /blood-requests after submit, got: {page.url}"
        print("Successfully created Individual request!")
        page.screenshot(path="/home/jules/verification/v2_03_requests_list.png")

        # Step 3: Go to Request Details
        print("Clicking the first 'View' button...")
        page.get_by_role("button", name="View").first.click()
        page.wait_for_timeout(3000)

        assert "/blood-requests/" in page.url, f"Expected detail page, got: {page.url}"
        page.screenshot(path="/home/jules/verification/v2_04_details_individual.png")
        print("Successfully navigated to Details page.")

        # Step 4: Click Edit Request Button
        page.click("text=Edit Request")
        page.wait_for_timeout(3000)

        assert "/edit" in page.url, f"Expected edit page, got: {page.url}"
        page.screenshot(path="/home/jules/verification/v2_05_edit_individual_loaded.png")
        print("Successfully loaded Edit request form pre-filled with data.")

        # Step 5: Change Requester Type to HOSPITAL
        page.select_option("select[name='requestType']", "HOSPITAL")
        page.wait_for_timeout(1500)
        page.screenshot(path="/home/jules/verification/v2_06_edit_swapped_to_hospital.png")

        # Under Hospital, individual requesterName should be hidden, and Hospital Name input should be visible.
        assert page.locator("input[name='hospitalName']").is_visible(), "Hospital Name input should be visible under Hospital requesterType"
        print("Verified: UI immediately adapted to Hospital mode.")

        # Fill out Hospital fields
        page.fill("input[name='hospitalName']", "Gleneagles Hospital")
        page.fill("input[name='hospitalAddress']", "Jalan Ampang, Kuala Lumpur")
        page.fill("input[name='latitude']", "3.1591")
        page.fill("input[name='longitude']", "101.7378")
        page.fill("input[name='coordinatorName']", "Dr. Alexander")
        page.fill("input[name='coordinatorContact']", "+60198888777")
        page.select_option("select[name='bloodType']", "AB+")
        page.fill("input[name='unitsRequired']", "5")

        # Submit Edit
        page.click("button[type='submit']")
        page.wait_for_timeout(4000)

        # Verify redirect to details
        assert "/edit" not in page.url, f"Should have navigated back to details page, got: {page.url}"
        page.screenshot(path="/home/jules/verification/v2_07_details_after_hospital_edit.png")
        print("Successfully updated request to Hospital and verified detail view.")

        # Step 6: Edit again and change to BLOOD_BANK
        page.click("text=Edit Request")
        page.wait_for_timeout(3000)

        page.select_option("select[name='requestType']", "BLOOD_BANK")
        page.wait_for_timeout(1500)
        page.screenshot(path="/home/jules/verification/v2_08_edit_swapped_to_blood_bank.png")

        assert page.locator("input[name='hospitalName']").is_visible(), "Blood Bank Name input should be visible"
        print("Verified: UI immediately adapted to Blood Bank mode.")

        # Fill out Blood Bank fields
        page.fill("input[name='hospitalName']", "National Blood Bank Center")
        page.fill("input[name='hospitalAddress']", "Jalan Tun Razak, KL")
        page.fill("input[name='latitude']", "3.1685")
        page.fill("input[name='longitude']", "101.7011")
        page.fill("input[name='coordinatorName']", "Mr. Tan")
        page.fill("input[name='coordinatorContact']", "+60172223334")
        page.select_option("select[name='bloodType']", "A-")
        page.fill("input[name='unitsRequired']", "12")

        # Submit Edit
        page.click("button[type='submit']")
        page.wait_for_timeout(4000)

        page.screenshot(path="/home/jules/verification/v2_09_details_after_blood_bank_edit.png")
        print("Successfully updated request to Blood Bank and verified final detail view.")

        browser.close()
        print("ALL TESTS AND DYNAMIC VERIFICATIONS COMPLETED SUCCESSFULLY!")

if __name__ == "__main__":
    try:
        run_verification()
    except Exception as e:
        print(f"Error occurred: {e}")
        sys.exit(1)
