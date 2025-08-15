import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Heart, Users, ExternalLink, Trophy, Clock } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative bg-primary text-primary-foreground py-20 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-5xl font-bold mb-4">The Lou Gehrig Fan Club</h1>
          <p className="text-xl mb-8 opacity-90">Honoring the Iron Horse Legacy • Supporting the ALS Community</p>
        </div>
      </section>

      {/* Photo Voting Section */}
      <section className="py-16 px-4 bg-card">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-foreground">
            Vote for Your Favorite Lou Gehrig Photo
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="group hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="aspect-[4/5] bg-muted rounded-lg mb-4 flex items-center justify-center">
                  <img
                    src="/lou-gehrig-batting.png"
                    alt="Lou Gehrig batting stance"
                    className="w-full h-full object-cover rounded-lg"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-lg">The Iron Horse at Bat</h3>
                  <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                    <Heart className="w-4 h-4" />
                    Vote
                  </Button>
                </div>
                <p className="text-muted-foreground mt-2">Classic batting stance, 1932</p>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="aspect-[4/5] bg-muted rounded-lg mb-4 flex items-center justify-center">
                  <img
                    src="/lou-gehrig-farewell.png"
                    alt="Lou Gehrig farewell speech"
                    className="w-full h-full object-cover rounded-lg"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-lg">Farewell Speech</h3>
                  <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                    <Heart className="w-4 h-4" />
                    Vote
                  </Button>
                </div>
                <p className="text-muted-foreground mt-2">July 4, 1939 - "Luckiest man"</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Join Club & Login Buttons */}
      <section className="py-12 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="text-lg px-8 py-6">
              <Users className="w-5 h-5 mr-2" />
              Join the Club
            </Button>
            <Button variant="outline" size="lg" className="text-lg px-8 py-6 bg-transparent">
              Members Login
            </Button>
          </div>
        </div>
      </section>

      {/* Fan Club News Feed */}
      <section className="py-16 px-4 bg-card">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-foreground">Fan Club News</h2>
          <div className="space-y-6">
            {[
              {
                title: "Annual Lou Gehrig Day Celebration Planning Underway",
                excerpt: "Join us as we plan this year's tribute event at Yankee Stadium...",
                date: "3 days ago",
                likes: 47,
              },
              {
                title: "New Gehrig Memorabilia Added to Club Collection",
                excerpt: "Rare photographs and documents from the Gehrig family archives...",
                date: "1 week ago",
                likes: 32,
              },
              {
                title: "ALS Research Fundraiser Exceeds Goal",
                excerpt: "Thanks to our amazing community, we've raised over $50,000...",
                date: "2 weeks ago",
                likes: 89,
              },
            ].map((post, index) => (
              <Card key={index} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-semibold text-lg">{post.title}</h3>
                    <Badge variant="secondary">{post.likes} likes</Badge>
                  </div>
                  <p className="text-muted-foreground mb-3">{post.excerpt}</p>
                  <p className="text-sm text-muted-foreground">{post.date}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ALS Community Support */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4 text-foreground">
            The Lou Gehrig Fan Club Supports the ALS Community
          </h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            In honor of Lou Gehrig's legacy, we proudly support organizations fighting ALS and helping patients and
            families.
          </p>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-accent">ALS CURE PROJECT</CardTitle>
                <CardDescription>Accelerating ALS research and drug development</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full gap-2">
                  <ExternalLink className="w-4 h-4" />
                  Learn More
                </Button>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-accent">I AM ALS</CardTitle>
                <CardDescription>Patient-led organization transforming ALS care</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full gap-2">
                  <ExternalLink className="w-4 h-4" />
                  Learn More
                </Button>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-accent">Live Like Lou</CardTitle>
                <CardDescription>Supporting ALS patients and their families</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full gap-2">
                  <ExternalLink className="w-4 h-4" />
                  Learn More
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* ALS Community Events Calendar */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                ALS Community Events Calendar
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { event: "ALS Walk for Life - Central Park", date: "March 15, 2025", location: "New York, NY" },
                  { event: "Research Fundraising Gala", date: "April 22, 2025", location: "Manhattan" },
                  { event: "Lou Gehrig Appreciation Day", date: "June 2, 2025", location: "Yankee Stadium" },
                ].map((event, index) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-muted rounded-lg">
                    <div>
                      <h4 className="font-medium">{event.event}</h4>
                      <p className="text-sm text-muted-foreground">{event.location}</p>
                    </div>
                    <Badge variant="outline">{event.date}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Q&A and Career Milestones */}
      <section className="py-16 px-4 bg-card">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Q&A Section */}
            <Card>
              <CardHeader>
                <CardTitle>Frequently Asked Questions</CardTitle>
                <CardDescription>Common questions about Lou Gehrig and the fan club</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { q: "When was Lou Gehrig born?", a: "June 19, 1903 in New York City" },
                  {
                    q: "How many consecutive games did he play?",
                    a: "2,130 consecutive games, earning him the nickname 'Iron Horse'",
                  },
                  { q: "What is ALS?", a: "Amyotrophic Lateral Sclerosis, also known as Lou Gehrig's disease" },
                ].map((faq, index) => (
                  <div key={index} className="border-b border-border pb-3 last:border-b-0">
                    <h4 className="font-medium mb-1">{faq.q}</h4>
                    <p className="text-sm text-muted-foreground">{faq.a}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Career Milestones Link */}
            <Card className="flex flex-col">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="w-5 h-5" />
                  Lou Gehrig's Career Milestones
                </CardTitle>
                <CardDescription>Explore the legendary career of the Iron Horse</CardDescription>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col justify-center">
                <div className="text-center space-y-4">
                  <div className="aspect-square w-32 mx-auto bg-muted rounded-full flex items-center justify-center">
                    <img
                      src="/lou-gehrig-yankees-vintage.png"
                      alt="Lou Gehrig career highlights"
                      className="w-full h-full object-cover rounded-full"
                    />
                  </div>
                  <Button size="lg" className="w-full">
                    View Career Milestones
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Fan Club Event Calendar */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-foreground">Fan Club Event Calendar</h2>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Upcoming Fan Club Events
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  {
                    event: "Monthly Fan Club Meeting",
                    date: "February 20, 2025",
                    time: "7:00 PM EST",
                    type: "Virtual Meeting",
                  },
                  {
                    event: "Gehrig Memorabilia Show & Tell",
                    date: "March 8, 2025",
                    time: "2:00 PM EST",
                    type: "In-Person Event",
                  },
                  {
                    event: "Yankees Spring Training Trip",
                    date: "March 25-28, 2025",
                    time: "All Day",
                    type: "Group Trip",
                  },
                  {
                    event: "Lou Gehrig Day Celebration",
                    date: "June 2, 2025",
                    time: "1:00 PM EST",
                    type: "Special Event",
                  },
                ].map((event, index) => (
                  <div key={index} className="flex justify-between items-center p-4 bg-muted rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium">{event.event}</h4>
                      <p className="text-sm text-muted-foreground">{event.time}</p>
                    </div>
                    <div className="text-right">
                      <Badge className="mb-1">{event.type}</Badge>
                      <p className="text-sm font-medium">{event.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-primary text-primary-foreground py-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-2xl font-bold mb-4">The Lou Gehrig Fan Club</h3>
          <p className="mb-6 opacity-90">
            "Today I consider myself the luckiest man on the face of the earth." - Lou Gehrig
          </p>
          <div className="flex justify-center space-x-6 text-sm opacity-75">
            <span>© 2025 Lou Gehrig Fan Club</span>
            <span>•</span>
            <span>Supporting ALS Research</span>
            <span>•</span>
            <span>Honoring the Iron Horse</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
