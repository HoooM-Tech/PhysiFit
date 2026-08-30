'use client'

import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Link from 'next/link'

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />

      {/* Back bar */}
      <div className="bg-primary-darker text-white">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 text-gray-300 hover:text-accent transition uppercase tracking-[0.18em] text-xs font-semibold"
          >
            ← Back to Sign Up
          </Link>
        </div>
      </div>

      {/* Hero Header */}
      <div className="bg-gray-50 border-b border-gray-200 py-12 sm:py-16">
        <div className="max-w-4xl mx-auto px-6">
          <div className="inline-flex items-center gap-3 mb-4">
            <span aria-hidden="true" className="h-[2px] w-10 bg-accent" />
            <span className="text-accent text-xs font-bold tracking-[0.25em] uppercase">LEGAL & POLICIES</span>
          </div>
          <h1 className="font-display text-4xl sm:text-6xl uppercase tracking-condensed leading-none text-primary-darker mb-4">
            Terms & Conditions
          </h1>
          <p className="text-gray-600 text-sm font-semibold uppercase tracking-wider">
            Last Updated: 28 August 2026
          </p>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-12 sm:py-16 flex-1 text-gray-800 leading-relaxed text-sm sm:text-base space-y-10">
        {/* Preamble Card */}
        <div className="bg-accent/10 border-l-4 border-accent p-6 rounded-r-lg shadow-xs">
          <p className="text-gray-900 font-medium leading-relaxed">
            These Terms & Conditions (“Terms”) govern your use of the services provided by Physifit Wellness & Fitness Services (“Physifit”, “we”, “us”, or “our”).
          </p>
          <p className="text-gray-900 font-medium leading-relaxed mt-3">
            By purchasing, booking, accessing, or participating in any Physifit service, you (“you” or “Client”) acknowledge that you have read, understood, and agreed to these Terms. If you do not agree to these Terms, please do not purchase or use our services.
          </p>
        </div>

        {/* Section 1 */}
        <section className="space-y-3">
          <h2 className="font-display text-2xl uppercase tracking-wide text-primary-darker pb-2 border-b border-gray-200">
            1. Our Services
          </h2>
          <p>
            Physifit provides personal training, fitness, wellness, exercise programming, and related services.
          </p>
          <p>
            Our services may include personal training, strength and conditioning, functional training, mobility and flexibility work, cardiovascular exercise, balance and stability training, low-impact exercise, exercise programming, and general fitness and wellness guidance.
          </p>
          <p>
            Our programmes may be adapted based on your goals, age, physical condition, progress, disclosed limitations, and the professional assessment of your trainer.
          </p>
          <p>
            Physifit is a fitness and wellness provider. Unless expressly stated otherwise, our services do not constitute medical diagnosis, medical treatment, physiotherapy, psychological treatment, or other healthcare services.
          </p>
          <p>
            You should seek advice from an appropriately qualified healthcare professional where you have concerns about your ability to exercise safely.
          </p>
        </section>

        {/* Section 2 */}
        <section className="space-y-3">
          <h2 className="font-display text-2xl uppercase tracking-wide text-primary-darker pb-2 border-b border-gray-200">
            2. Your Health & Medical Information
          </h2>
          <p>Your safety is important to us.</p>
          <p>
            Before participating in our services, you are responsible for providing accurate and complete information about your health and physical condition where requested. This may include information relating to:
          </p>
          <ul className="list-disc list-inside space-y-1.5 pl-4 text-gray-700">
            <li>Existing medical conditions;</li>
            <li>Previous or current injuries;</li>
            <li>Surgeries;</li>
            <li>Persistent pain;</li>
            <li>Physical limitations;</li>
            <li>Cardiovascular or respiratory conditions;</li>
            <li>Neurological conditions;</li>
            <li>Pregnancy or postpartum status;</li>
            <li>Medications that may affect exercise; and</li>
            <li>Any other condition or circumstance that may reasonably affect your ability to exercise safely.</li>
          </ul>
          <p>
            You must notify Physifit if there is a material change in your health or physical condition during your programme.
          </p>
          <p>
            We may require you to obtain medical clearance from an appropriately qualified healthcare professional before beginning or continuing certain activities. Where we reasonably believe that continued participation may present a material safety risk, we may modify, suspend, or refuse to provide a particular service until appropriate clearance is obtained.
          </p>
        </section>

        {/* Section 3 */}
        <section className="space-y-3">
          <h2 className="font-display text-2xl uppercase tracking-wide text-primary-darker pb-2 border-b border-gray-200">
            3. Exercise & Assumption of Risk
          </h2>
          <p>Physical exercise carries inherent risks, even where reasonable precautions are taken.</p>
          <p>
            These risks may include muscle soreness, fatigue, strains, sprains, falls, bruising, joint or back discomfort, musculoskeletal injury, cardiovascular stress, shortness of breath, aggravation of pre-existing conditions, and, in rare circumstances, serious injury or medical emergencies.
          </p>
          <p>
            By participating in Physifit services, you acknowledge and accept that these inherent risks exist.
          </p>
          <p>
            You agree to participate responsibly, follow reasonable instructions provided by your trainer, and communicate immediately if you experience pain, dizziness, unusual symptoms, or other concerns. You should not continue an exercise that you reasonably believe is unsafe for you.
          </p>
          <p>
            Nothing in these Terms excludes or limits any liability or legal right that cannot lawfully be excluded or limited under Nigerian law.
          </p>
        </section>

        {/* Section 4 */}
        <section className="space-y-3">
          <h2 className="font-display text-2xl uppercase tracking-wide text-primary-darker pb-2 border-b border-gray-200">
            4. Packages & Payment
          </h2>
          <p>
            The price, number of sessions, duration, and other applicable terms of your package will be communicated to you before purchase.
          </p>
          <p>
            Unless otherwise agreed in writing, payment must be made in full before your package begins.
          </p>
          <p>
            Payments should only be made through payment channels officially designated by Physifit. Unless expressly authorised by Physifit in writing, you should not make payments to a trainer’s personal account.
          </p>
          <p>
            Prices may change from time to time. Any price change will not affect a package that you have already purchased and paid for.
          </p>
        </section>

        {/* Section 5 */}
        <section className="space-y-3">
          <h2 className="font-display text-2xl uppercase tracking-wide text-primary-darker pb-2 border-b border-gray-200">
            5. Package Validity
          </h2>
          <p>
            Unless otherwise stated at the time of purchase, personal training packages are valid for 30 calendar days from the package activation date.
          </p>
          <p>
            Sessions must be completed within the applicable validity period. Unused sessions expire when the package validity period ends and will not automatically carry over to a subsequent package.
          </p>
          <p>
            Physifit may, at its discretion, extend the validity period in exceptional circumstances.
          </p>
          <p>
            Where a session cannot take place because of a cancellation or unavailability attributable to Physifit, that session will not be deducted from your package.
          </p>
        </section>

        {/* Section 6 */}
        <section className="space-y-3">
          <h2 className="font-display text-2xl uppercase tracking-wide text-primary-darker pb-2 border-b border-gray-200">
            6. Booking, Cancellation & Rescheduling
          </h2>
          <p>
            Sessions must be booked in advance through the communication channels designated by Physifit.
          </p>
          <p>
            We require at least 24 hours’ notice if you need to cancel or reschedule a confirmed session.
          </p>
          <p>
            Where you provide at least 24 hours’ notice, we will make reasonable efforts to reschedule the session within your package validity period, subject to trainer availability.
          </p>
          <p>
            Where you cancel with less than 24 hours’ notice or fail to attend a scheduled session, Physifit may treat the session as used and deduct it from your package.
          </p>
          <p>
            If you arrive late, your session will generally still end at its scheduled time. Late arrival does not automatically entitle you to additional training time.
          </p>
          <p>
            Physifit may exercise reasonable discretion in exceptional circumstances. An exception granted on one occasion does not create an obligation to grant the same exception in the future.
          </p>
        </section>

        {/* Section 7 */}
        <section className="space-y-3">
          <h2 className="font-display text-2xl uppercase tracking-wide text-primary-darker pb-2 border-b border-gray-200">
            7. Changes or Cancellations by Physifit
          </h2>
          <p>
            We may occasionally need to reschedule or cancel a session because of circumstances including trainer illness, emergencies, safety concerns, trainer availability, severe weather, security concerns, government restrictions, infrastructure failures, or other circumstances outside our reasonable control.
          </p>
          <p>
            Where Physifit cancels a session, you will not lose that session. We will make reasonable efforts to arrange an alternative appointment. Where appropriate, Physifit may provide a substitute trainer.
          </p>
        </section>

        {/* Section 8 */}
        <section className="space-y-3">
          <h2 className="font-display text-2xl uppercase tracking-wide text-primary-darker pb-2 border-b border-gray-200">
            8. Your Responsibilities
          </h2>
          <p>You agree to:</p>
          <ul className="list-disc list-inside space-y-1.5 pl-4 text-gray-700">
            <li>Provide accurate and complete information relevant to your participation;</li>
            <li>Follow reasonable instructions given by your trainer;</li>
            <li>Inform your trainer of pain, dizziness, discomfort, or unusual symptoms;</li>
            <li>Stop or modify an exercise when instructed to do so;</li>
            <li>Communicate honestly about your physical condition;</li>
            <li>Attend scheduled sessions on time;</li>
            <li>Wear appropriate clothing and footwear;</li>
            <li>Maintain reasonable hydration;</li>
            <li>Follow applicable safety rules;</li>
            <li>Treat Physifit personnel respectfully and professionally; and</li>
            <li>Avoid participating while intoxicated or otherwise impaired.</li>
          </ul>
          <p>You are responsible for your own decisions regarding your participation in physical activity.</p>
        </section>

        {/* Section 9 */}
        <section className="space-y-3">
          <h2 className="font-display text-2xl uppercase tracking-wide text-primary-darker pb-2 border-b border-gray-200">
            9. Trainer Responsibilities
          </h2>
          <p>Physifit will use reasonable professional care in providing our services. We will seek to:</p>
          <ul className="list-disc list-inside space-y-1.5 pl-4 text-gray-700">
            <li>Provide appropriately designed training;</li>
            <li>Adapt exercises where reasonably appropriate;</li>
            <li>Prioritise client safety;</li>
            <li>Provide reasonable safety instructions;</li>
            <li>Maintain reasonable confidentiality; and</li>
            <li>Conduct ourselves professionally.</li>
          </ul>
          <p>However, no fitness programme can eliminate all risks associated with physical activity.</p>
        </section>

        {/* Section 10 */}
        <section className="space-y-3">
          <h2 className="font-display text-2xl uppercase tracking-wide text-primary-darker pb-2 border-b border-gray-200">
            10. Results
          </h2>
          <p>We want you to achieve meaningful results, but fitness outcomes vary between individuals.</p>
          <p>Physifit does not guarantee any specific:</p>
          <ul className="list-disc list-inside space-y-1.5 pl-4 text-gray-700">
            <li>Weight-loss result;</li>
            <li>Strength gain;</li>
            <li>Body composition;</li>
            <li>Mobility outcome;</li>
            <li>Recovery period;</li>
            <li>Physical appearance; or</li>
            <li>Other fitness or wellness result.</li>
          </ul>
          <p>
            Your results may depend on factors including consistency, nutrition, sleep, lifestyle, genetics, age, health conditions, and adherence to your programme.
          </p>
        </section>

        {/* Section 11 */}
        <section className="space-y-3">
          <h2 className="font-display text-2xl uppercase tracking-wide text-primary-darker pb-2 border-b border-gray-200">
            11. Liability
          </h2>
          <p>
            Nothing in these Terms excludes or limits any liability that cannot legally be excluded or limited under applicable Nigerian law.
          </p>
          <p>
            Subject to that limitation, Physifit will not be responsible for loss, injury, or damage arising solely from:
          </p>
          <ul className="list-disc list-inside space-y-1.5 pl-4 text-gray-700">
            <li>Inherent risks associated with ordinary physical exercise;</li>
            <li>Inaccurate, incomplete, or withheld health information provided by you;</li>
            <li>Your failure to follow reasonable safety instructions;</li>
            <li>Your unauthorised use of equipment or exercises;</li>
            <li>Your decision to continue exercising despite concerning symptoms; or</li>
            <li>Circumstances outside Physifit’s reasonable control.</li>
          </ul>
          <p>
            Nothing in these Terms releases Physifit from liability arising from fraud, wilful misconduct, or any other liability that applicable law does not permit us to exclude.
          </p>
        </section>

        {/* Section 12 */}
        <section className="space-y-3">
          <h2 className="font-display text-2xl uppercase tracking-wide text-primary-darker pb-2 border-b border-gray-200">
            12. Indemnification
          </h2>
          <p>
            To the extent permitted by applicable law, you agree to be responsible for reasonable losses, claims, costs, or expenses arising directly from your material breach of these Terms, deliberate misuse of Physifit services or property, materially false health information provided by you, or unlawful or intentionally harmful conduct.
          </p>
          <p>
            This provision does not apply to the extent that the relevant loss results from conduct or liability that cannot lawfully be transferred to you.
          </p>
        </section>

        {/* Section 13 */}
        <section className="space-y-3">
          <h2 className="font-display text-2xl uppercase tracking-wide text-primary-darker pb-2 border-b border-gray-200">
            13. Training Programmes & Intellectual Property
          </h2>
          <p>
            Training programmes, exercise plans, written materials, videos, templates, educational materials, methodologies, and other materials created or provided by Physifit remain the intellectual property of Physifit or the applicable rights holder unless expressly stated otherwise.
          </p>
          <p>
            You are granted a limited, personal, non-exclusive, non-transferable right to use these materials for your own personal fitness purposes.
          </p>
          <p>You may not, without our prior written permission:</p>
          <ul className="list-disc list-inside space-y-1.5 pl-4 text-gray-700">
            <li>Resell Physifit programmes;</li>
            <li>Distribute them commercially;</li>
            <li>Present them as your own work;</li>
            <li>Reproduce them for third parties; or</li>
            <li>Use them to establish or operate a competing training service.</li>
          </ul>
          <p>
            Nothing prevents you from applying general knowledge or exercise techniques learned through your training for your own personal benefit.
          </p>
        </section>

        {/* Section 14 */}
        <section className="space-y-3">
          <h2 className="font-display text-2xl uppercase tracking-wide text-primary-darker pb-2 border-b border-gray-200">
            14. Photography & Video
          </h2>
          <p>
            From time to time, Physifit may photograph or record training sessions for purposes including progress tracking, education, training, marketing, or promotion.
          </p>
          <p>
            Where we intend to use your image or likeness for promotional purposes, we will obtain your applicable consent.
          </p>
          <p>
            You may withdraw your marketing consent by contacting us in writing. Withdrawal applies prospectively and does not necessarily require us to recall materials that were lawfully published or distributed before your withdrawal.
          </p>
          <p>
            You must not record Physifit trainers, staff, or other clients in a manner that captures private, confidential, or identifiable information without appropriate consent.
          </p>
        </section>

        {/* Section 15 */}
        <section className="space-y-3">
          <h2 className="font-display text-2xl uppercase tracking-wide text-primary-darker pb-2 border-b border-gray-200">
            15. Privacy
          </h2>
          <p>
            We may collect and process information reasonably necessary to provide and administer our services. This may include your contact information, booking information, payment information, training history, fitness information, and health information relevant to the safe delivery of our services.
          </p>
          <p>
            We will take reasonable measures to protect information in our possession. We may disclose information where required by law, court order, emergency circumstances, or another lawful basis.
          </p>
        </section>

        {/* Section 16 */}
        <section className="space-y-3">
          <h2 className="font-display text-2xl uppercase tracking-wide text-primary-darker pb-2 border-b border-gray-200">
            16. Client Conduct
          </h2>
          <p>We are committed to maintaining a safe, respectful, and professional environment.</p>
          <p>We do not tolerate:</p>
          <ul className="list-disc list-inside space-y-1.5 pl-4 text-gray-700">
            <li>Abuse;</li>
            <li>Threatening behaviour;</li>
            <li>Harassment;</li>
            <li>Sexual harassment;</li>
            <li>Violence;</li>
            <li>Intimidation;</li>
            <li>Discrimination;</li>
            <li>Deliberate property damage; or</li>
            <li>Serious disruptive behaviour.</li>
          </ul>
          <p>
            Physifit may suspend or terminate services where a Client’s conduct creates a material safety, legal, or operational concern.
          </p>
        </section>

        {/* Section 17 */}
        <section className="space-y-3">
          <h2 className="font-display text-2xl uppercase tracking-wide text-primary-darker pb-2 border-b border-gray-200">
            17. Suspension & Termination
          </h2>
          <p>Physifit may suspend or terminate your access to our services where:</p>
          <ul className="list-disc list-inside space-y-1.5 pl-4 text-gray-700">
            <li>Continued training creates a material safety concern;</li>
            <li>You provide materially false or misleading health information;</li>
            <li>You engage in serious misconduct;</li>
            <li>Required payments remain outstanding;</li>
            <li>You materially breach these Terms; or</li>
            <li>Continued provision of the service would be unlawful or reasonably unsafe.</li>
          </ul>
          <p>
            You may also discontinue your participation at any time, subject to the payment, cancellation, refund, and package-expiration provisions applicable to your purchase.
          </p>
          <p>Termination does not affect rights or obligations that arose before termination.</p>
        </section>

        {/* Section 18 */}
        <section className="space-y-3">
          <h2 className="font-display text-2xl uppercase tracking-wide text-primary-darker pb-2 border-b border-gray-200">
            18. Events Outside Our Control
          </h2>
          <p>
            Physifit will not be responsible for a failure or delay in providing services caused by circumstances reasonably outside our control.
          </p>
          <p>
            These may include natural disasters, flood, fire, epidemics or pandemics, war, terrorism, civil unrest, government restrictions, serious security events, major infrastructure failures, severe weather, or other circumstances beyond our reasonable control.
          </p>
          <p>
            Where reasonably possible, we will notify affected Clients and seek to reschedule services.
          </p>
        </section>

        {/* Section 19 */}
        <section className="space-y-3">
          <h2 className="font-display text-2xl uppercase tracking-wide text-primary-darker pb-2 border-b border-gray-200">
            19. Complaints & Disputes
          </h2>
          <p>
            If you have a complaint or concern about our services, please contact Physifit first and give us an opportunity to resolve the matter.
          </p>
          <p>
            We encourage both parties to attempt to resolve disputes through good-faith discussion. Where appropriate, the parties may agree to mediation or arbitration in accordance with applicable Nigerian law.
          </p>
          <p>
            Nothing in these Terms prevents either party from seeking urgent relief from a court where legally available.
          </p>
        </section>

        {/* Section 20 */}
        <section className="space-y-3">
          <h2 className="font-display text-2xl uppercase tracking-wide text-primary-darker pb-2 border-b border-gray-200">
            20. Governing Law
          </h2>
          <p>These Terms are governed by the laws of the Federal Republic of Nigeria.</p>
          <p>
            Subject to any applicable dispute-resolution process, disputes arising from these Terms may be brought before a court of competent jurisdiction in Nigeria.
          </p>
        </section>

        {/* Section 21 */}
        <section className="space-y-3">
          <h2 className="font-display text-2xl uppercase tracking-wide text-primary-darker pb-2 border-b border-gray-200">
            21. Electronic Communications
          </h2>
          <p>
            We may communicate with you through email, WhatsApp, SMS, telephone, or other communication channels that you provide to us. These communications may relate to:
          </p>
          <ul className="list-disc list-inside space-y-1.5 pl-4 text-gray-700">
            <li>Session bookings;</li>
            <li>Cancellations;</li>
            <li>Rescheduling;</li>
            <li>Payments;</li>
            <li>Programme updates;</li>
            <li>Notices; and</li>
            <li>Other matters relating to your Physifit services.</li>
          </ul>
          <p>You are responsible for ensuring that the contact information you provide remains accurate.</p>
        </section>

        {/* Section 22 */}
        <section className="space-y-3">
          <h2 className="font-display text-2xl uppercase tracking-wide text-primary-darker pb-2 border-b border-gray-200">
            22. Changes to These Terms
          </h2>
          <p>
            We may update these Terms from time to time to reflect changes to our services, business practices, legal requirements, or other operational considerations.
          </p>
          <p>
            Where we make material changes, we will take reasonable steps to notify affected Clients. The updated Terms will become effective on the date stated at the beginning of the updated Terms.
          </p>
          <p>
            Your continued use of Physifit services after the effective date of updated Terms constitutes acceptance of the updated Terms to the extent permitted by law.
          </p>
        </section>

        {/* Section 23 */}
        <section className="space-y-3">
          <h2 className="font-display text-2xl uppercase tracking-wide text-primary-darker pb-2 border-b border-gray-200">
            23. Severability
          </h2>
          <p>
            If any provision of these Terms is found to be invalid, unlawful, or unenforceable, that provision will be modified or removed only to the extent necessary. The remaining provisions will continue to apply to the fullest extent permitted by law.
          </p>
        </section>

        {/* Section 24 */}
        <section className="space-y-3">
          <h2 className="font-display text-2xl uppercase tracking-wide text-primary-darker pb-2 border-b border-gray-200">
            24. No Waiver
          </h2>
          <p>
            If we do not immediately enforce a provision of these Terms, this does not mean that we have waived our right to enforce it later. A waiver is effective only for the specific circumstance for which it is given unless expressly stated otherwise.
          </p>
        </section>

        {/* Section 25 */}
        <section className="space-y-3">
          <h2 className="font-display text-2xl uppercase tracking-wide text-primary-darker pb-2 border-b border-gray-200">
            25. Entire Agreement
          </h2>
          <p>
            These Terms, together with any additional terms expressly provided to you in connection with a particular Physifit service or purchase, constitute the agreement between you and Physifit concerning your use of our services.
          </p>
          <p>
            They supersede prior discussions or representations concerning those services, except where expressly incorporated into the applicable agreement.
          </p>
        </section>

        {/* Section 26 */}
        <section className="space-y-4 bg-gray-50 border border-gray-200 rounded-xl p-6 sm:p-8">
          <h2 className="font-display text-2xl uppercase tracking-wide text-primary-darker pb-2 border-b border-gray-300">
            26. Contact Us
          </h2>
          <p>If you have questions about these Terms, your package, or our services, please contact us:</p>
          <div className="space-y-2 font-semibold text-gray-900 text-sm">
            <p><strong>Physifit Wellness & Fitness Services</strong></p>
            <p>📧 Email: <a href="mailto:info.physifitservices@gmail.com" className="text-primary-darker hover:text-accent underline">info.physifitservices@gmail.com</a></p>
            <p>📞 Phone: <a href="tel:+2347038920250" className="text-primary-darker hover:text-accent underline">+234 703 892 0250</a></p>
            <p>📍 Address: Victoria Island, Lagos, Nigeria</p>
          </div>
        </section>

        {/* Closing Acceptance Note */}
        <div className="bg-primary-darker text-white p-6 rounded-xl text-center space-y-2">
          <h3 className="font-display text-xl uppercase tracking-wide text-accent">Acceptance</h3>
          <p className="text-gray-200 text-sm">
            By purchasing, booking, accessing, or participating in Physifit services, you confirm that you have read, understood, and agreed to these Terms & Conditions.
          </p>
          <p className="text-gray-400 text-xs uppercase tracking-wider pt-2">Last Updated: 28 August 2026</p>
        </div>
      </main>

      <Footer />
    </div>
  )
}
