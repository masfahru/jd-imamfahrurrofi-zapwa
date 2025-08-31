import { Link } from "react-router";
import { Bot, Package, ShoppingCart, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, } from "@/components/ui/card";

export function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-muted/20">
      <header className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
        <Link to="/" className="flex items-center gap-2 font-bold text-lg">
          <Zap className="h-6 w-6 text-primary"/>
          <span>ZapWA</span>
        </Link>
        <nav className="flex items-center gap-2">
          <Button asChild variant="outline">
            <Link to="/admin/login">Admin Login</Link>
          </Button>
          <Button asChild>
            <Link to="/user/login">User Login</Link>
          </Button>
        </nav>
      </header>

      <main className="flex-1">
        <section className="container mx-auto flex flex-col items-center gap-4 px-4 py-20 text-center md:px-6 md:py-32">
          <h1 className="text-4xl font-extrabold tracking-tight md:text-5xl lg:text-6xl">
            Automate Your Business with AI
          </h1>
          <p className="max-w-2xl text-muted-foreground md:text-xl">
            ZapWA is a prototype demonstrating how an AI-powered agent can
            manage product inquiries and process orders directly through
            chat, streamlining your customer service.
          </p>
          <div className="flex gap-4 mt-6">
            <Button asChild size="lg">
              <Link to="/user/signup">Get Started</Link>
            </Button>
          </div>
        </section>

        {/* Features Section */}
        <section
          id="features"
          className="w-full py-12 md:py-24 lg:py-32 bg-background"
        >
          <div className="container mx-auto px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
              <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm">
                Key Features
              </div>
              <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                Everything You Need to Succeed
              </h2>
              <p
                className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Manage your business effortlessly with our powerful, integrated
                tools.
              </p>
            </div>
            <div className="mx-auto grid max-w-5xl items-start gap-8 sm:grid-cols-2 md:gap-12 lg:grid-cols-3">
              <div className="grid gap-1 text-center">
                <Bot className="h-10 w-10 mx-auto mb-2 text-primary"/>
                <h3 className="text-xl font-bold">AI-Powered Chat Agent</h3>
                <p className="text-muted-foreground">
                  Train a custom AI to handle customer questions and create
                  orders automatically.
                </p>
              </div>
              <div className="grid gap-1 text-center">
                <Package className="h-10 w-10 mx-auto mb-2 text-primary"/>
                <h3 className="text-xl font-bold">Product Management</h3>
                <p className="text-muted-foreground">
                  Easily add, edit, and manage your product catalog that the AI
                  uses.
                </p>
              </div>
              <div className="grid gap-1 text-center">
                <ShoppingCart className="h-10 w-10 mx-auto mb-2 text-primary"/>
                <h3 className="text-xl font-bold">Order Management</h3>
                <p className="text-muted-foreground">
                  View and update orders created by the AI or manually through
                  the dashboard.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Application Flow Section */}
        <section
          id="flow"
          className="w-full py-12 md:py-24 lg:py-32 bg-muted/20"
        >
          <div className="container mx-auto grid items-center justify-center gap-4 px-4 text-center md:px-6">
            <div className="space-y-3">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
                How It Works: A Simple Flow
              </h2>
              <p
                className="mx-auto max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Follow these simple steps to get your automated store
                up and running.
              </p>
            </div>
            <div className="mx-auto w-full max-w-4xl grid grid-cols-1 sm:grid-cols-3 gap-8 mt-8">
              <Card>
                <CardHeader>
                  <CardTitle>1. Sign Up & Add Products</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>
                    Create your user account and populate your store with products
                    your customers can buy.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>2. Configure Your AI Agent</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>
                    Define the personality and behavior of your AI. Activate it
                    to start serving customers.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>3. Let the AI Handle Orders</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>
                    The AI interacts with customers via chat, answers
                    questions, and creates orders in your dashboard.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-background border-t py-8">
        <div className="container mx-auto px-4 md:px-6 text-center text-muted-foreground">
          <p>&copy; 2025 ZapWA. A Prototype for AI-driven Commerce.</p>
        </div>
      </footer>
    </div>
  );
}
