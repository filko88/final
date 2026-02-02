"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight, CheckCircle2 } from "lucide-react"

const tutorialSteps = [
  {
    title: "What Is an Agent?",
    subtitle: "Your shopping companion for Chinese platforms",
    content:
      "An agent is a service that helps you buy items from Chinese platforms like Taobao or Weidian, which don't ship internationally. The agent places the order, receives the item, takes photos for you to review, and ships it to your door—anywhere in the world.",
    highlight: "Think of them as your personal shopping assistant in China!",
  },
  {
    title: "Why Use an Agent?",
    subtitle: "Breaking down language and payment barriers",
    content:
      "Most Chinese sellers don't support international cards, addresses, or English language. Agents solve this by handling payments in RMB (¥), translating listings and specs, receiving and inspecting your orders, and providing international shipping with stealth packaging.",
    tips: [
      "No need for Chinese language skills",
      "International payment methods accepted",
      "Quality inspection before shipping",
      "Worldwide delivery options",
    ],
  },
  {
    title: "Our Favorite: Oopbuy",
    subtitle: "Speed, quality, and transparency",
    content:
      "In our experience, Oopbuy is the smoothest and most efficient agent. Their speed, QC quality, and simple interface stand out. But since we believe in full transparency, we've added an Agent Link Changer on our website—so you can choose your preferred agent (like Oopbuy, CNFans, or Acbuy) with one click.",
    highlight: "We're transparent - choose any agent you prefer!",
  },
  {
    title: "How Agent Buying Works",
    subtitle: "Simple 8-step process",
    content:
      "The process is straightforward. Paste a Taobao or Weidian link into the agent's site, select options (size, color), and confirm the price. You pay for the product, the agent buys it, and it arrives at their warehouse. They send QC photos, you approve or reject, then you pay for international shipping and the agent ships the item to your country.",
    stats: ["8 Simple Steps", "24 Hours Avg Processing", "99% Success Rate"],
  },
  {
    title: "QC Photos: Your Safety Check",
    subtitle: "Inspect before you accept",
    content:
      "Once your item arrives, the agent takes clear photos of it so you can inspect for flaws or mistakes. If anything's off, you can reject the item. QC quality and angles vary per agent—Kakobuy has some of the clearest and fastest.",
    highlight: "Quality control is your protection against defective items",
  },
  {
    title: "Total Costs to Expect",
    subtitle: "Two-part payment system",
    content:
      "You'll pay in two parts: Item payment (item cost + Chinese domestic shipping + small agent fee) and Shipping payment (global shipping cost + optional services like repack, insurance, etc.). Kakobuy is upfront with their fees and shows full cost breakdowns.",
    tips: [
      "Item cost is just the beginning",
      "Factor in agent fees",
      "International shipping varies",
      "Optional services available",
    ],
  },
  {
    title: "Shipping: Speed vs Stealth",
    subtitle: "Choose your shipping strategy",
    content:
      "Agents offer shipping lines like DHL, GD-EMS, SAL, or 'Stealth Line.' Each has pros and cons: DHL is fast but has a higher customs risk, while GD-EMS/Stealth is slower but has a lower risk. Kakobuy auto-suggests the best shipping line based on your country.",
    stats: ["3 Days DHL", "14 Days Stealth", "85% Success Rate"],
  },
  {
    title: "Hauling: Buy Now, Ship Later",
    subtitle: "Smart shipping strategy",
    content:
      "Agents let you hold multiple items at their warehouse (30–90 days free). Once your haul is ready, you combine all items into one box to save on shipping. Kakobuy's haul dashboard is super clean and easy to use.",
    highlight: "Combine orders to save big on shipping costs!",
  },
  {
    title: "Choosing a Good Agent",
    subtitle: "What to look for",
    content:
      "Look for these features: English-friendly interface, clear shipping options with tracking, fast QC uploads, active support team, and good Reddit or Discord reviews. We like Kakobuy—but you're free to choose yours using our agent switcher.",
    tips: [
      "User-friendly interface",
      "Fast QC photos",
      "Responsive support",
      "Good community reviews",
      "Transparent pricing",
    ],
  },
  {
    title: "Pro Tips Before You Order",
    subtitle: "Level up your rep game",
    content:
      "Always double-check size charts, join our Discord for link reviews and help, use hidden links for branded reps, don't rush—haul and ship smart, and try different agents if you're curious—our site supports switching with ease.",
  },
]

export default function TutorialsClient() {
  const [currentStep, setCurrentStep] = useState(0)
  const step = tutorialSteps[currentStep]
  const isFirstStep = currentStep === 0
  const isLastStep = currentStep === tutorialSteps.length - 1

  const handleNext = () => {
    if (!isLastStep) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrev = () => {
    if (!isFirstStep) {
      setCurrentStep(currentStep - 1)
    }
  }

  return (
    <div className="min-h-screen py-12">
      <div className="mx-auto max-w-4xl px-4 sm:px-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-foreground mb-3">
            How to Buy with Agents
          </h1>
          <p className="text-muted-foreground text-lg">
            Your complete guide to shopping from China
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">
              Step {currentStep + 1} of {tutorialSteps.length}
            </span>
            <span className="text-sm font-medium text-foreground">
              {Math.round(((currentStep + 1) / tutorialSteps.length) * 100)}%
            </span>
          </div>
          <div className="h-2 rounded-full bg-foreground/10 overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{
                width: `${((currentStep + 1) / tutorialSteps.length) * 100}%`,
              }}
            />
          </div>
        </div>

        {/* Step Indicators */}
        <div className="mb-8 flex flex-wrap gap-2 justify-center">
          {tutorialSteps.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentStep(index)}
              className={`h-8 w-8 rounded-full text-xs font-medium transition-all ${
                index === currentStep
                  ? "bg-primary text-primary-foreground scale-110"
                  : index < currentStep
                  ? "bg-green-500 text-white"
                  : "bg-foreground/10 text-muted-foreground hover:bg-foreground/20"
              }`}
            >
              {index < currentStep ? (
                <CheckCircle2 className="h-4 w-4 mx-auto" />
              ) : (
                index + 1
              )}
            </button>
          ))}
        </div>

        {/* Content Card */}
        <Card className="p-8 mb-8 border-foreground/10 bg-card">
          <div className="space-y-6">
            {/* Title */}
            <div>
              <Badge className="mb-3" variant="secondary">
                Step {currentStep + 1}
              </Badge>
              <h2 className="text-3xl font-bold text-foreground mb-2">
                {step.title}
              </h2>
              <p className="text-lg text-muted-foreground">{step.subtitle}</p>
            </div>

            {/* Content */}
            <p className="text-foreground leading-relaxed">{step.content}</p>

            {/* Highlight */}
            {step.highlight && (
              <div className="bg-primary/10 border-l-4 border-primary p-4 rounded-r-lg">
                <p className="text-foreground font-medium">{step.highlight}</p>
              </div>
            )}

            {/* Tips */}
            {step.tips && (
              <div className="space-y-2">
                <h3 className="font-semibold text-foreground mb-3">Key Points:</h3>
                <ul className="space-y-2">
                  {step.tips.map((tip, index) => (
                    <li
                      key={index}
                      className="flex items-start gap-2 text-muted-foreground"
                    >
                      <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Stats */}
            {step.stats && (
              <div className="grid grid-cols-3 gap-2 sm:gap-4">
                {step.stats.map((stat, index) => (
                  <div
                    key={index}
                    className="bg-foreground/5 rounded-lg p-2 sm:p-4 text-center"
                  >
                    <p className="font-semibold text-foreground text-xs sm:text-lg">{stat}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>

        {/* Navigation */}
        <div className="flex items-center justify-between gap-4">
          <Button
            variant="outline"
            onClick={handlePrev}
            disabled={isFirstStep}
            className="flex items-center gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>

          <div className="text-sm text-muted-foreground">
            {currentStep + 1} / {tutorialSteps.length}
          </div>

          <Button
            onClick={handleNext}
            disabled={isLastStep}
            className="flex items-center gap-2"
          >
            {isLastStep ? "Finish" : "Next"}
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Completion Message */}
        {isLastStep && (
          <div className="mt-8 text-center">
            <Card className="p-8 border-green-500/20 bg-green-500/5">
              <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-foreground mb-2">
                You're All Set!
              </h3>
              <p className="text-muted-foreground mb-6">
                You now know everything about buying with agents. Ready to start
                shopping?
              </p>
              <Button asChild size="lg">
                <a href="/finds">Browse Finds</a>
              </Button>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
