import React from "react";
import HeroCarouselNew from '../components/HeroCarouselNew';

export function HomePage() {
  return (
    <>
      <HeroCarouselNew />

      <section id="welcome" className="text-center">
        <div className="container d-flex justify-content-center">
          <div
            className="p-4 mt-3 bg-dark text-light shadow rounded"
            style={{ maxWidth: "1500px" }}
          >
            <h1 id="title">Welcome to OSAI&apos;s</h1>
            <p id="description" className="mb-4">
              OSAI&apos;s is one of the leading companies in the fashion industry.
              Pure fashion created from the finest Japanese fibers. Hand-woven
              and tailor-made for every body type -- from kids to adults, daily
              wear to timeless pieces, we have it all and you will always find
              something for everyone with us.
            </p>

            <a href="/about" className="btn btn-primary">
              More &gt;
            </a>
          </div>
        </div>
      </section>

      <section id="gallery" className="mt-5">
        <h2 className="text-center">Wear Your Style</h2>

        <div className="row g-4 mt-3">
          <div className="col-md-4">
            <img
              src="/images/Men1.jpg"
              alt="Men's Fit 1"
              className="img-fluid rounded shadow"
            />
          </div>
          <div className="col-md-4">
            <img
              src="/images/Woman1.jpg"
              alt="Women's Fit 1"
              className="img-fluid rounded shadow"
            />
          </div>
          <div className="col-md-4">
            <img
              src="/images/Kids1.jpg"
              alt="Kid's Fit 1"
              className="img-fluid rounded shadow"
            />
          </div>

          <div className="col-md-4">
            <img
              src="/images/Family1.jpg"
              alt="Family's Fit 1"
              className="img-fluid rounded shadow"
            />
          </div>
          <div className="col-md-4">
            <img
              src="/images/Men2.jpg"
              alt="Men's Fit 2"
              className="img-fluid rounded shadow"
            />
          </div>
          <div className="col-md-4">
            <img
              src="/images/Woman2.jpg"
              alt="Women's Fit 2"
              className="img-fluid rounded shadow"
            />
          </div>

          <div className="col-md-4">
            <img
              src="/images/Kids2.jpg"
              alt="Kid's Fit 2"
              className="img-fluid rounded shadow"
            />
          </div>
          <div className="col-md-4">
            <img
              src="/images/Family2.jpg"
              alt="Family's Fit 2"
              className="img-fluid rounded shadow"
            />
          </div>
          <div className="col-md-4">
            <img
              src="/images/Men3.jpg"
              alt="Men's Fit 3"
              className="img-fluid rounded shadow"
            />
          </div>

          <div className="col-md-4">
            <img
              src="/images/Woman3.jpg"
              alt="Women's Fit 3"
              className="img-fluid rounded shadow"
            />
          </div>
          <div className="col-md-4">
            <img
              src="/images/Kids3.jpg"
              alt="Kid's Fit 3"
              className="img-fluid rounded shadow"
            />
          </div>
          <div className="col-md-4">
            <img
              src="/images/Family3.jpg"
              alt="Family's Fit 3"
              className="img-fluid rounded shadow"
            />
          </div>
        </div>
      </section>
    </>
  );
}
