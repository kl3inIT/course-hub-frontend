import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, Target, Award, Heart, BookOpen, Globe, Lightbulb, Shield } from "lucide-react"
import Link from "next/link"

export default function AboutPage() {
  const teamMembers = [
    {
      name: "Sarah Johnson",
      role: "CEO & Founder",
      image: "/placeholder.svg?height=200&width=200",
      description: "Former tech executive with 15+ years in education technology.",
    },
    {
      name: "Michael Chen",
      role: "CTO",
      image: "/placeholder.svg?height=200&width=200",
      description: "Full-stack developer passionate about creating seamless learning experiences.",
    },
    {
      name: "Emily Rodriguez",
      role: "Head of Content",
      image: "/placeholder.svg?height=200&width=200",
      description: "Educational expert with a background in curriculum development.",
    },
    {
      name: "David Kim",
      role: "Lead Designer",
      image: "/placeholder.svg?height=200&width=200",
      description: "UX/UI designer focused on making learning accessible and engaging.",
    },
  ]

  const values = [
    {
      icon: <BookOpen className="h-8 w-8" />,
      title: "Quality Education",
      description: "We believe everyone deserves access to high-quality, expert-led education.",
    },
    {
      icon: <Globe className="h-8 w-8" />,
      title: "Global Accessibility",
      description: "Making learning accessible to students worldwide, regardless of location or background.",
    },
    {
      icon: <Lightbulb className="h-8 w-8" />,
      title: "Innovation",
      description: "Continuously improving our platform with cutting-edge technology and teaching methods.",
    },
    {
      icon: <Shield className="h-8 w-8" />,
      title: "Trust & Safety",
      description: "Providing a safe, secure learning environment for all our students and instructors.",
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-primary/5 to-secondary/5">
        <div className="container mx-auto text-center space-y-6">
          <h1 className="text-4xl md:text-5xl font-bold">About LearnHub</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            We're on a mission to democratize education and empower learners worldwide with the skills they need to
            succeed in the digital age.
          </p>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-3xl font-bold">Our Story</h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  Founded in 2020, LearnHub was born from a simple belief: that quality education should be accessible
                  to everyone, everywhere. Our founders, a team of educators and technologists, recognized the growing
                  gap between traditional education and the rapidly evolving demands of the modern workforce.
                </p>
                <p>
                  What started as a small platform with just 10 courses has grown into a comprehensive learning
                  ecosystem serving over 50,000 students worldwide. We've partnered with industry experts, renowned
                  institutions, and leading companies to create courses that are not just educational, but
                  transformational.
                </p>
                <p>
                  Today, LearnHub continues to innovate in the online education space, leveraging cutting-edge
                  technology to create personalized, engaging, and effective learning experiences.
                </p>
              </div>
            </div>
            <div className="relative">
              <img
                src="/placeholder.svg?height=400&width=600"
                alt="LearnHub team working together"
                className="w-full h-auto rounded-lg shadow-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16 px-4 bg-muted/50">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="border-2">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-lg bg-primary text-white">
                    <Target className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-2xl">Our Mission</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  To democratize access to high-quality education by providing affordable, flexible, and engaging online
                  learning experiences that empower individuals to achieve their personal and professional goals.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-lg bg-secondary text-white">
                    <Award className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-2xl">Our Vision</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  To become the world's leading platform for skill development and lifelong learning, where anyone,
                  anywhere can access the education they need to thrive in an ever-changing world.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-16 px-4">
        <div className="container mx-auto space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-bold">Our Values</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              These core values guide everything we do and shape the way we serve our learning community.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-center mb-4">
                    <div className="p-4 rounded-full bg-primary/10 text-primary">{value.icon}</div>
                  </div>
                  <CardTitle className="text-lg">{value.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm leading-relaxed">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 px-4 bg-muted/50">
        <div className="container mx-auto space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-bold">Meet Our Team</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Our diverse team of educators, technologists, and innovators is passionate about transforming education.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {teamMembers.map((member, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-center mb-4">
                    <img
                      src={member.image || "/placeholder.svg"}
                      alt={member.name}
                      className="w-24 h-24 rounded-full object-cover border-4 border-primary/10"
                    />
                  </div>
                  <CardTitle className="text-lg">{member.name}</CardTitle>
                  <p className="text-primary font-medium">{member.role}</p>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm leading-relaxed">{member.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="space-y-2">
              <div className="flex justify-center">
                <Users className="h-12 w-12 text-primary" />
              </div>
              <h3 className="text-3xl font-bold">50,000+</h3>
              <p className="text-muted-foreground">Students Worldwide</p>
            </div>
            <div className="space-y-2">
              <div className="flex justify-center">
                <BookOpen className="h-12 w-12 text-primary" />
              </div>
              <h3 className="text-3xl font-bold">1,000+</h3>
              <p className="text-muted-foreground">Expert-Led Courses</p>
            </div>
            <div className="space-y-2">
              <div className="flex justify-center">
                <Award className="h-12 w-12 text-primary" />
              </div>
              <h3 className="text-3xl font-bold">95%</h3>
              <p className="text-muted-foreground">Completion Rate</p>
            </div>
            <div className="space-y-2">
              <div className="flex justify-center">
                <Heart className="h-12 w-12 text-primary" />
              </div>
              <h3 className="text-3xl font-bold">4.8/5</h3>
              <p className="text-muted-foreground">Student Satisfaction</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-primary text-primary-foreground">
        <div className="container mx-auto text-center space-y-8">
          <h2 className="text-3xl font-bold">Ready to Join Our Learning Community?</h2>
          <p className="text-xl opacity-90 max-w-2xl mx-auto">
            Become part of a global community of learners and start your journey toward achieving your goals.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/courses">
              <Button size="lg" variant="secondary" className="text-lg px-8">
                Explore Courses
              </Button>
            </Link>
            <Link href="/register">
              <Button
                size="lg"
                variant="outline"
                className="text-lg px-8 border-white text-white hover:bg-white hover:text-primary"
              >
                Sign Up Free
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
