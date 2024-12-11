import React, { useEffect, useState, useRef } from 'react';
import '../scss/PaymentDesk.scss';

const PaymentDesk = () => {
    const [paymentReceipt, setPaymentReceipt] = useState({
        orderId: '',
        orderDateTime: '',
        productDetailList: [],
    });
    const [loading, setLoading] = useState(true);
    const wsPayment = useRef(null);

    const SERVER_IP = '192.168.67.240';

    const payCartItemList = async (orderId) => {
        try {
            const response = await fetch(`http://${SERVER_IP}:8080/api/paymentDesk/payment/${orderId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            if (response.ok) {
                alert('결제 완료!');
                console.log('결제 완료!');
                const completedMessage = JSON.stringify({ status: 'completed' });
                wsPayment.current.send(completedMessage);
                await stopSensor();
                window.location.reload();
            } else {
                alert('결제 시도 중 실패!');
                console.log('결제 시도 중 실패!');
            }
        } catch (error) {
            alert(`에러 발생: ${error}`);
            console.log(`에러 발생: ${error}`);
        }
    };

    const stopSensor = async () => {
        try {
            const response = await fetch(`http://${SERVER_IP}:8080/api/paymentDesk/stop-sensor`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            if (response.ok) {
                alert('센서가 꺼졌습니다.');
                console.log('센서가 꺼졌습니다.');
            } else {
                alert('센서가 꺼지지 않았습니다.');
                console.log('센서가 꺼지지 않았습니다.');
            }
        } catch (error) {
            alert(`에러 발생: ${error}`);
            console.log(`에러 발생: ${error}`);
        }
    };

    useEffect(() => {
        wsPayment.current = new WebSocket(`ws://${SERVER_IP}:8080/ws/shopping?clientId=CLIENT_PAYMENTDESK`);

        wsPayment.current.onopen = () => console.log('WebSocket 연결 성공');
        wsPayment.current.onmessage = (e) => {
            try {
                const paymentReceiptJson = JSON.parse(e.data);
                setPaymentReceipt(paymentReceiptJson);
                console.log(paymentReceiptJson);
                setLoading(false);
            } catch (err) {
                console.error('JSON 파싱 오류: ', err);
            }
        };
        wsPayment.current.onclose = () => console.log('WebSocket 연결 종료');
        wsPayment.current.onerror = (err) => console.error('WebSocket 오류: ', err);

        return () => {
            if (wsPayment.current) wsPayment.current.close();
        };
    }, []);

    return (
        <div className='paymentDesk-container'>
            <section className='guide-section'>
                <h1>계산대</h1>
            </section>
            <section className='payment-receipt-container'>
                {loading ? (
                    <div className='comment-container'>
                        <span>카트에 장착된 RFID 카드를</span>
                        <span>리더기에 접촉하십시오</span>
                    </div>
                ) : (
                    <div className='receipt-container'>
                        <p>{paymentReceipt.orderId}</p>
                        <p>{paymentReceipt.orderDateTime}</p>
                        <ul>
                            {paymentReceipt.productDetailList.length > 0 ? (
                                paymentReceipt.productDetailList.map((product) => (
                                    <li className='receipt-field-container' key={product.productId}>
                                        <span>{product.productName}</span>
                                        <span>{product.quantity}개</span>
                                        <span>{product.quantity * product.productPrice}원</span>
                                    </li>
                                ))
                            ) : (
                                <p>No products found.</p>
                            )}
                        </ul>
                        <div className='receipt-summary-container'>
                            <span>수량</span>
                            <span className='receipt-summary-value'>
                                {paymentReceipt.productDetailList.reduce(
                                    (quantitySum, productDetail) => (quantitySum += productDetail.quantity),
                                    0
                                )}
                                개
                            </span>
                            <span>총 결제금액</span>
                            <span className='receipt-summary-value'>
                                {paymentReceipt.productDetailList.reduce(
                                    (priceSum, productDetail) =>
                                        (priceSum += productDetail.quantity * productDetail.productPrice),
                                    0
                                )}
                                원
                            </span>
                        </div>
                        <div>
                            <button
                                className='receipt-confirm-button'
                                onClick={() => payCartItemList(paymentReceipt.orderId)}
                            >
                                확인
                            </button>
                        </div>
                    </div>
                )}
            </section>
        </div>
    );
};

export default PaymentDesk;
