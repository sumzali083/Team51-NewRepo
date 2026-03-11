import React from "react";

export function AboutPage() {
  return (
    <>
      <section className="text-center mb-4">
        <h1 className="fw-bold text-decoration-underline">About OSAI</h1>
        <p className="fw-bold">From Japan to the streets around the globe</p>
      </section>

      <section className="p-4 bg-dark text-light shadow rounded mb-5">
        <h2 className="mb-3">Our Story</h2>
        <p>
          At OSAI, every piece begins with premium materials sourced directly
          from Japan&apos;s most respected textile mills. We choose fabrics known for
          their durability, comfort, and craftsmanship - fibers that stay
          vibrant, hold their shape, and feel luxurious on the skin. This
          commitment ensures that every hoodie, T-shirt, or streetwear essential
          we produce meets the highest standards from the very first touch.
        </p>
      </section>

      <section id="gallery" className="mb-5">
        <div className="row g-4">
          <div className="col-md-4">
            <img
              src="/images/about_us1.jpeg"
              alt="Materials"
              className="img-fluid rounded shadow"
            />
          </div>
          <div className="col-md-4">
            <img
              src="/images/about_us2.jpeg"
              alt="Design Studio"
              className="img-fluid rounded shadow"
            />
          </div>
          <div className="col-md-4">
            <img
              src="/images/about_us3.jpeg"
              alt="Product Testing"
              className="img-fluid rounded shadow"
            />
          </div>
        </div>
      </section>

      <section className="p-4 bg-dark text-light shadow rounded mb-5">
        <h2 className="mb-3">Design &amp; Inspiration</h2>
        <p>
          Our design team is the creative heartbeat of OSAI - a collective of
          passionate artists and innovators inspired by the energy of Tokyo,
          Osaka, and global urban life. They draw from graffiti, architecture,
          music, and modern minimalism to craft pieces that blend authenticity
          with style. Every design is bold yet wearable, merging Japanese
          precision with contemporary streetwear aesthetics.
        </p>
      </section>
    </>
  );
}
