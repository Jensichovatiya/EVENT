/// <reference path="../types.d.ts" />
import React from 'react';

interface TermsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccept: () => void;
}

export default function TermsModal({ isOpen, onClose, onAccept }: TermsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Terms & Conditions</h3>
          <button className="modal-close" onClick={onClose}>
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>
        <div className="modal-body">
          <h4>Return Policy and Cancellation Policy - Rules</h4>
          <h5 style={{ color: '#f8fafc', marginTop: '12px', marginBottom: '6px' }}>User</h5>
          <p>User can claim about refund when event or live streaming not starting from organizer side.</p>
          <p>Here some criteria about refund:</p>
          <ul>
            <li>User claim before 30 days of booking: return 90% amount</li>
            <li>User claim between 21-30 days of booking: return 70% amount</li>
            <li>User claim between 11-20 days of booking: return 30% amount</li>
            <li>User claim between 6-10 days of booking: return 10% amount</li>
            <li>User claim between 1-5 days of booking: no return any amount</li>
          </ul>
          <p>If Event reschedule then open two options for user. One option is cancelled reschedule event and ask for refund or 2nd is continue with reschedule event.</p>
          <p>
            If user cancel reschedules event ask for refund, then total amount will be refund. And 6% minus amount on event organizer it will be collect from
            deposit or F-coin.
          </p>

          <h5 style={{ color: '#f8fafc', marginTop: '12px', marginBottom: '6px' }}>Event Organizer</h5>
          <p>If Event cancel then refund total amount to users and 6% amount will be minus on event organizer. If organizer have enough coin or deposit then deduct 1st deposit then coin. And show on organizer dashboard.</p>
        </div>
        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>Close</button>
          <button className="btn-primary" style={{ width: 'auto', padding: '0 20px', height: '40px' }} onClick={onAccept}>
            Agree & Accept
          </button>
        </div>
      </div>
    </div>
  );
}
