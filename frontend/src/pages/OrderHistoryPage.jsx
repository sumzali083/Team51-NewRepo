import React, {useEffect, useState} from "react";
export default function OrderHistory(){
    var[orders, setOrders] = useState([]);

    useEffect(function(){
        fetch("/api/orders/history", {
            credentials: "include"
        })
            .then(function(res){
                return res.json();
            })

            .then(function(data){
                setOrders(data);
            })

            .catch(function(err){
                console.error(err);
            })
    }, []);

    return(
        <div className="container mt-4">
            <h2 className="mb-4">Order History</h2>

            {orders.length===0 &&(
                <div className="alert alert-info">You have placed no orders</div>
            )}

            {orders.map(function(order){
                return (
                    <div key={order.id} className="mb-5">
                        <h5 className="mb-3">
                            Order #{order.id} - £{Number(order.total_price).toFixed(2)}
                        </h5>

                        <div className="row g-4">
                            {order.items.map(function(item, index){
                                const image =
                                    item.image || (item.images && item.images[0]) || "/images/placeholder.jpg";
                                        return(
                                            <div key={index} className="col-md-4">
                                                <div className="card h-100 shadow-sm">
                                                    <img src={image} className="card-image-top" alt={item.name}/>
                                                    <div className="card-body d-flex flex-column">
                                                        <h5 className="card-title">{item.name}</h5>
                                                        <p className="card-tect fw-bold">£{Number(item.price_each).toFixed(2)}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                            })}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}