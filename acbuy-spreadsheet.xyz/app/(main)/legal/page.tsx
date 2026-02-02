import { getPageMetadata } from "@/lib/page-metadata"

export const metadata = getPageMetadata("legal")

const sections = [
  {
    number: "1",
    title: "Scope of Application",
    body:
      'These Terms and Conditions (T&C) govern the use of this website (hereinafter referred to as the "Platform" or "Spreadsheet"), operated by acbuy-spreadsheet.xyz, hereinafter referred to as the "Operator." By accessing or using the Platform, Users agree to be bound by these T&C. If you do not agree, please discontinue use immediately.',
  },
  {
    number: "2",
    title: "Description of the Platform",
    subsections: [
      {
        subtitle: "2.1",
        text: "The Platform functions as a curated directory and informational resource (spreadsheet) that aggregates links to products listed on third-party Chinese marketplaces, including but not limited to Taobao, Weidian, and 1688.",
      },
      {
        subtitle: "2.2",
        text: "The Operator is not a seller. We do not stock, ship, or sell any of the items listed. The Platform serves solely as an educational tool to help Users navigate third-party marketplaces and view product information in a centralized format.",
      },
    ],
  },
  {
    number: "3",
    title: "No Verification of Authenticity",
    subsections: [
      {
        subtitle: "3.1",
        text: "Authenticity Disclaimer: The Operator does not verify, authenticate, or guarantee the brand legitimacy, quality, or \"original\" status of any products linked on the Platform.",
      },
      {
        subtitle: "3.2",
        text: "Users acknowledge that products sourced from the aforementioned third-party marketplaces may be non-authentic, replicas, or otherwise not authorized by the original trademark owners.",
      },
      {
        subtitle: "3.3",
        text: "The Platform is intended for educational and research purposes only. Any decision to purchase an item via a third-party link is made solely by the User.",
      },
    ],
  },
  {
    number: "4",
    title: "Affiliate Disclosure and Commissions",
    subsections: [
      {
        subtitle: "4.1",
        text: 'The Platform contains affiliate links. This means that if a User clicks on a link and subsequently makes a purchase through a third-party marketplace or shipping agent, the Operator may receive a commission or "finder\'s fee" at no additional cost to the User.',
      },
      {
        subtitle: "4.2",
        text: "These commissions help maintain the Platform. The presence of a link does not constitute an endorsement of the product's quality or authenticity.",
      },
      {
        subtitle: "4.3",
        text: "The Operator is not responsible for the calculation, payment, or disputes regarding affiliate commissions handled by third-party shipping agents or platforms.",
      },
    ],
  },
  {
    number: "5",
    title: "Limitation of Liability",
    subsections: [
      {
        subtitle: "5.1",
        text: "To the fullest extent permitted by law, the Operator shall not be liable for any direct, indirect, or consequential damages arising from the use of the Platform.",
      },
      {
        subtitle: "5.2",
        text: "Legal Risks: The Operator is not responsible for any legal issues (including customs seizures, trademark infringement claims, or fines) or financial losses that may arise from the purchase of non-authentic or \"replica\" goods.",
      },
      {
        subtitle: "5.3",
        text: "Product Issues: Any issues regarding product quality, sizing, shipping delays, or incorrect items must be settled directly with the third-party seller or the User's chosen shipping agent. We provide the link; we do not provide the service.",
      },
    ],
  },
  {
    number: "6",
    title: "User Responsibilities",
    subsections: [
      {
        subtitle: "6.1",
        text: "Users are responsible for complying with their own local laws and regulations regarding the importation of goods.",
      },
      {
        subtitle: "6.2",
        text: "Users acknowledge that purchasing from international marketplaces carries inherent risks, and they agree to assume all such risks when clicking external links.",
      },
    ],
  },
  {
    number: "7",
    title: "Intellectual Property",
    subsections: [
      {
        subtitle: "7.1",
        text: "The organization, design, and specific curation of the Spreadsheet/Platform are the intellectual property of the Operator.",
      },
      {
        subtitle: "7.2",
        text: "All product images, brand names, and logos remain the property of their respective copyright/trademark holders. The Operator claims no ownership over the items linked.",
      },
    ],
  },
  {
    number: "8",
    title: "Changes to Terms",
    body:
      "The Operator reserves the right to update these T&C at any time. Continued use of the Platform after changes are posted constitutes your acceptance of the new terms.",
  },
  {
    number: "9",
    title: "Governing Law",
    body:
      "These T&C shall be governed by and construed in accordance with the laws of Germany, without regard to its conflict of law provisions.",
  },
]

export default function LegalPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8 py-8">
      {/* Header */}
      <div className="space-y-3">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
          Legal Notice
        </p>
        <h1 className="text-3xl sm:text-4xl font-bold text-foreground">
          Terms and Conditions
        </h1>
        <p className="text-base text-muted-foreground leading-relaxed">
          Please read these terms carefully before using our platform. By accessing
          or using this website, you agree to be bound by these terms.
        </p>
      </div>

      {/* Sections */}
      <div className="space-y-8">
        {sections.map((section) => (
          <div
            key={section.number}
            className="rounded-xl border border-foreground/10 bg-card p-6 shadow-sm"
          >
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-sm">
                {section.number}
              </div>
              <div className="flex-1 space-y-4">
                <h2 className="text-xl font-bold text-foreground">
                  {section.title}
                </h2>
                {section.body && (
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {section.body}
                  </p>
                )}
                {section.subsections && (
                  <div className="space-y-3 ml-4">
                    {section.subsections.map((sub, index) => (
                      <div key={index} className="space-y-1">
                        <p className="text-xs font-semibold text-foreground/70">
                          {sub.subtitle}
                        </p>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {sub.text}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer Note */}
      <div className="rounded-xl border border-primary/20 bg-primary/5 p-6">
        <p className="text-sm text-foreground leading-relaxed">
          <strong>Important:</strong> These terms are provided for transparency
          and legal compliance. If you have any questions or concerns, please
          contact us before using the platform.
        </p>
      </div>
    </div>
  )
}
