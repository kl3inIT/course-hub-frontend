"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Star } from "lucide-react"

const testimonials = [
  {
    id: "students",
    label: "Students",
    reviews: [
      {
        name: "Sarah Johnson",
        role: "Web Developer",
        content:
          "The courses here are incredibly well-structured. I went from knowing nothing about React to building my own applications in just 3 months!",
        rating: 5,
        avatar: "/placeholder.svg?height=40&width=40",
      },
      {
        name: "Michael Chen",
        role: "Software Engineer",
        content:
          "Amazing platform! The instructors are top-notch and the community is very supportive. Highly recommend for anyone looking to advance their career.",
        rating: 5,
        avatar: "/placeholder.svg?height=40&width=40",
      },
      {
        name: "Emily Rodriguez",
        role: "UX Designer",
        content:
          "I love how practical the courses are. Every lesson builds on the previous one, and the projects really help solidify the concepts.",
        rating: 5,
        avatar: "/placeholder.svg?height=40&width=40",
      },
    ],
  },
  {
    id: "instructors",
    label: "Instructors",
    reviews: [
      {
        name: "Dr. James Wilson",
        role: "Senior Instructor",
        content:
          "Teaching on this platform has been a rewarding experience. The tools provided make it easy to create engaging content and interact with students.",
        rating: 5,
        avatar: "/placeholder.svg?height=40&width=40",
      },
      {
        name: "Lisa Thompson",
        role: "Industry Expert",
        content:
          "The support team is fantastic, and the platform's features allow me to deliver high-quality education to students worldwide.",
        rating: 5,
        avatar: "/placeholder.svg?height=40&width=40",
      },
    ],
  },
  {
    id: "companies",
    label: "Companies",
    reviews: [
      {
        name: "Tech Solutions Inc.",
        role: "HR Director",
        content:
          "We've partnered with LearnHub to upskill our employees. The results have been outstanding - our team's productivity has increased significantly.",
        rating: 5,
        avatar: "/placeholder.svg?height=40&width=40",
      },
      {
        name: "StartupXYZ",
        role: "CEO",
        content:
          "LearnHub's corporate training programs helped our startup team acquire the skills needed to scale our business effectively.",
        rating: 5,
        avatar: "/placeholder.svg?height=40&width=40",
      },
    ],
  },
]

export function TestimonialsSection() {
  return (
    <section className="py-16 px-4">
      <div className="container mx-auto space-y-8">
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-bold">What Our Community Says</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Hear from students, instructors, and companies who have transformed their learning journey with us
          </p>
        </div>

        <Tabs defaultValue="students" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            {testimonials.map((category) => (
              <TabsTrigger key={category.id} value={category.id}>
                {category.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {testimonials.map((category) => (
            <TabsContent key={category.id} value={category.id} className="mt-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {category.reviews.map((review, index) => (
                  <Card key={index}>
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        <div className="flex items-center gap-1">
                          {[...Array(review.rating)].map((_, i) => (
                            <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          ))}
                        </div>

                        <p className="text-muted-foreground italic">"{review.content}"</p>

                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={review.avatar || "/placeholder.svg"} />
                            <AvatarFallback>
                              {review.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-semibold text-sm">{review.name}</p>
                            <p className="text-xs text-muted-foreground">{review.role}</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </section>
  )
}
