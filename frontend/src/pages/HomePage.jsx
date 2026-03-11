import React from "react";

export function HomePage() {
  return (
    <>
      <div
        id="osaiCarousel"
        className="carousel slide mt-4 mb-5"
        data-bs-ride="carousel"
        data-bs-interval="2250"
      >
        <div className="carousel-indicators">
          <button
            type="button"
            data-bs-target="#osaiCarousel"
            data-bs-slide-to="0"
            className="active"
          ></button>
          <button
            type="button"
            data-bs-target="#osaiCarousel"
            data-bs-slide-to="1"
          ></button>
          <button
            type="button"
            data-bs-target="#osaiCarousel"
            data-bs-slide-to="2"
          ></button>
        </div>

        <div className="carousel-inner rounded shadow">
          <div className="carousel-item active">
            <img
              src="/images/Slider1(1).png"
              className="d-block w-100"
              alt="sale slide 1"
            />
          </div>

          <div className="carousel-item">
            <img
              src="/images/Slider2(2).jpeg"
              className="d-block w-100"
              alt="sale slide 2"
            />
          </div>

          <div className="carousel-item">
            <img
              src="/images/Slider3(3).jpeg"
              className="d-block w-100"
              alt="kids style"
            />
          </div>
        </div>

        <button
          className="carousel-control-prev"
          type="button"
          data-bs-target="#osaiCarousel"
          data-bs-slide="prev"
        >
          <span className="carousel-control-prev-icon"></span>
        </button>

        <button
          className="carousel-control-next"
          type="button"
          data-bs-target="#osaiCarousel"
          data-bs-slide="next"
        >
          <span className="carousel-control-next-icon"></span>
        </button>
      </div>

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
              and tailor-made for every body type - from kids to adults, daily
              wear to timeless pieces, we have it all and you will always find
              something for everyone with us.
            </p>

            <a href="/about" className="btn btn-primary">
              More -&gt;
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
