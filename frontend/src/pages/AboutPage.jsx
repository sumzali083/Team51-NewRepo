import React, { useEffect, useRef } from "react";

export function AboutPage() {

  // Create refs for each animated section
  const introRef = useRef(null);
  const image1Ref = useRef(null);
  const text1Ref = useRef(null);
  const image2Ref = useRef(null);
  const text2Ref = useRef(null);
  const definesUsRef = useRef(null);

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
    [introRef.current, image1Ref.current, text1Ref.current, image2Ref.current, text2Ref.current, definesUsRef.current].forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <main className="about-page" style={{ backgroundColor: "#0b0b0b", color: "#fff", minHeight: "100vh", paddingTop: "3rem" }}>
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

      <section ref={definesUsRef} className="container py-5 mb-5" style={{ backgroundColor: "rgba(255,255,255,0.02)", borderRadius: "0.5rem" }} data-animation="fadeInDown">
        <h2 className="text-center mb-4">What Defines Us</h2>
        <div className="row gy-4">
          {[
            { title: "Craftsmanship", description: "Every garment is cut, stitched, and finished with meticulous attention to detail." },
            { title: "Authenticity", description: "We use high-quality fabrics and dependable construction built for daily wear." },
            { title: "Timelessness", description: "Designed to outlast short trends and remain a core part of your wardrobe." }
          ].map((item) => (
            <div key={item.title} className="col-md-4 text-center">
              <h3 className="h5 fw-light mb-2">{item.title}</h3>
              <p style={{ color: "#fff" }}>{item.description}</p>
            </div>
          ))}
        </div>
      </section>

    </main>
  );
}
