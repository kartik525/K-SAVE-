"use client";
import Hero from "@/components/Hero";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { featuresData, howItWorksData, statsData, testimonialsData } from "./data/landing";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen items-center justify-center mt-40 bg-zinc-50 font-sans dark:bg-black">
      <Hero />

      {/* Stats */}
      <section className=" py-20 bg-blue-50">
        <div className="container mx-auto text-center">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {statsData.map((stat, index) => (
              <div key={index} className="text-center">
                <h2 className="text-2xl font-bold mb-2 text-blue-500">{stat.value}</h2>
                <p className="text-gray-600">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto p-8">
          <h2 className="text-3xl font-bold mb-8 text-center">
            Everything you need in one place
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {featuresData.map((feature, index) => (
              <Card key={index} className="p-6">
                <CardContent className="space-y-4 pt-4">
                  {feature.icon}
                  <h3 className="text-lg font-semibold">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}

          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto p-8">
          <h2 className="text-3xl font-bold mb-8 text-center">
            How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {howItWorksData.map((step, index) => (
              <div className="text-center" key={index}>
                <div className="w-16 h-16 mx-auto mb-4 flex justify-center items-center bg-blue-50 rounded-full">
                  {step.icon}
                </div>
                <h3 className="text-xl font-semibold mb-4">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </div>
            ))}

          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto p-8">
          <h2 className="text-3xl font-bold mb-8 text-center">
            What our Users say
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {testimonialsData.map((Testimonials, index) => (
              <Card key={index} className="p-6">
                <CardContent className="space-y-4 pt-4">
                  <div className="flex items-center">
                    <Image src={Testimonials.image} alt="Testimonials" width={50} height={50} className="rounded-full" />
                    <div className="ml-4">
                      <div>{Testimonials.name}</div>
                      <div>{Testimonials.role}
                      </div>
                    </div>



                  </div>
                  <div>
                    {Testimonials.quote}
                  </div>

                </CardContent>
              </Card>
            ))}

          </div>
        </div>
      </section>

      <section className="py-20 bg-blue-600">
        <div className="container mx-auto p-8 text-center">
          <h2 className="text-3xl font-bold mb-4 text-center text-white">
            Ready to take control of your finances?
          </h2>
          <p className="text-blue-50 max-w-2xl mx-auto mb-8">
            Join our community of users and take control of your finances today.
          </p>
          <Link href={'/dashboard'}>
            <Button size={'lg'} className='px-4 bg-white text-blue-600 hover:text-blue-50 mt-4 cursor-pointer animate-bounce'>Get Started</Button></Link>
        </div>
      </section>


    </div>
  );
}
