import React, { useState, useEffect, useRef } from "react";

export function AboutPage() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  
  // Create refs for each animated section
  const introRef = useRef(null);
  const section1Ref = useRef(null);
  const image1Ref = useRef(null);
  const text1Ref = useRef(null);
  const section2Ref = useRef(null);
  const image2Ref = useRef(null);
  const text2Ref = useRef(null);

  useEffect(() => {
    // Set up Intersection Observer for scroll-triggered animations
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observerCallback = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-on-scroll');
        } else {
          entry.target.classList.remove('animate-on-scroll');
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);

    // Observe all animated elements
    [introRef.current, image1Ref.current, text1Ref.current, image2Ref.current, text2Ref.current].forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const handleSubscribe = (e) => {
    e.preventDefault();
    setSubscribed(true);
    setTimeout(() => {
      setEmail("");
      setSubscribed(false);
    }, 3000);
  };

  return (
    <main style={{ backgroundColor: "#0b0b0b", color: "#fff", minHeight: "100vh", paddingTop: "3rem" }}>
      <section ref={introRef} className="container text-center py-5" data-animation="fadeInUp">
        <div>
          <h1 className="fw-bold text-decoration-underline display-5 mb-3">About OSAI</h1>
          <p className="fw-bold mb-3">From Japan to the streets around the globe</p>
          <p className="lead mx-auto" style={{ maxWidth: "720px", color: "#fff" }}>
            At OSAI, every piece begins with premium materials sourced directly from Japan's most respected textile mills. We choose fabrics known for their durability, comfort, and craftsmanship -- fibers that stay vibrant, hold their shape, and feel luxurious on the skin. This commitment ensures that every hoodie, T-shirt, or streetwear essential we produce meets the highest standards from the very first touch.
          </p>
        </div>
      </section>

      <section className="container py-5">
        <div className="row align-items-center gy-4">
          <div ref={image1Ref} className="col-md-6" data-animation="slideInLeft">
            <img src="/images/about_us1.jpeg" alt="Materials" className="img-fluid rounded-3 shadow about-image" />
          </div>

          <div ref={text1Ref} className="col-md-6" data-animation="fadeInRight">
            <h2 className="h3 fw-light mb-3">Our Story</h2>
            <p style={{ color: "#fff" }}>
              At OSAI, every piece begins with premium materials sourced directly from Japan's most respected textile mills. We choose fabrics known for their durability, comfort, and craftsmanship -- fibers that stay vibrant, hold their shape, and feel luxurious on the skin. This commitment ensures that every hoodie, T-shirt, or streetwear essential we produce meets the highest standards from the very first touch.
            </p>
          </div>
        </div>
      </section>

      <section className="container py-5">
        <div className="row align-items-center gy-4">
          <div ref={image2Ref} className="col-md-6 order-md-2" data-animation="slideInRight">
            <img src="/images/about_us3.jpeg" alt="Design Studio" className="img-fluid rounded-3 shadow about-image" />
          </div>

          <div ref={text2Ref} className="col-md-6 order-md-1" data-animation="fadeInLeft">
            <h2 className="h3 fw-light mb-3">Design &amp; Inspiration</h2>
            <p style={{ color: "#fff" }}>
              Our design team is the creative heartbeat of OSAI -- a collective of passionate artists and innovators inspired by the energy of Tokyo, Osaka, and global urban life. They draw from graffiti, architecture, music, and modern minimalism to craft pieces that blend authenticity with style. Every design is bold yet wearable, merging Japanese precision with contemporary streetwear aesthetics.
            </p>
          </div>
        </div>
      </section>

      <section className="container py-5" style={{ backgroundColor: "rgba(255,255,255,0.02)", borderRadius: "0.5rem" }}>
        <h2 className="text-center mb-4">What Defines Us</h2>
        <div className="row gy-4">
          {[
            { title: "Craftsmanship", description: "Every fragrance is handcrafted with meticulous attention to detail." },
            { title: "Authenticity", description: "We use only the highest quality natural ingredients." },
            { title: "Timelessness", description: "Designed to transcend trends, becoming cherished companions." }
          ].map((item) => (
            <div key={item.title} className="col-md-4 text-center">
              <h3 className="h5 fw-light mb-2">{item.title}</h3>
              <p style={{ color: "#fff" }}>{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="container py-4">
        <form onSubmit={handleSubscribe} className="d-flex flex-column flex-md-row gap-2">
          <input
            type="email"
            className="form-control"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button className="btn btn-light" type="submit">Subscribe</button>
        </form>
        {subscribed && <p className="mt-2">Thanks for subscribing.</p>}
      </section>
    </main>
  );
}
