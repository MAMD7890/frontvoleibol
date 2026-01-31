import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

// Interfaces
export interface WompiConfig {
  publicKey: string;
  sandbox: boolean;
  currency: string;
}

export interface WompiIntegritySignature {
  signature: string;
  reference: string;
  amountInCents: number;
  currency: string;
}

export interface WompiPaymentLinkRequest {
  idEstudiante: number;
  amount: number;
  currency: string;
  name: string;
  description: string;
  customerEmail: string;
  customerName: string;
  redirectUrl: string;
  mesPagado: string;
  singleUse: boolean;
  expiresAt?: number;
  collectShipping: boolean;
}

export interface WompiPaymentLinkResponse {
  id: string;
  name: string;
  description: string;
  amountInCents: number;
  currency: string;
  paymentLinkUrl: string;
  singleUse: boolean;
  active: boolean;
  expiresAt: number;
  reference: string;
  success: boolean;
  message: string;
}

export interface WompiTransactionResponse {
  transactionId: string;
  status: string;
  reference: string;
  amountInCents: number;
  currency: string;
  paymentMethodType: string;
  paymentLinkUrl: string;
  redirectUrl: string;
  message: string;
  success: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class WompiService {
  private apiUrl = 'http://localhost:8080/api/wompi';

  constructor(private http: HttpClient) {}

  /**
   * Obtiene la configuración pública de Wompi
   */
  getConfig(): Observable<WompiConfig> {
    return this.http.get<WompiConfig>(`${this.apiUrl}/config`);
  }

  /**
   * Genera la firma de integridad para el widget de Wompi
   */
  generateIntegritySignature(
    amount: number,
    reference: string,
    currency: string = 'COP'
  ): Observable<WompiIntegritySignature> {
    const params = new HttpParams()
      .set('amount', amount.toString())
      .set('reference', reference)
      .set('currency', currency);

    return this.http.post<WompiIntegritySignature>(
      `${this.apiUrl}/integrity-signature`,
      null,
      { params }
    );
  }

  /**
   * Genera una referencia única para el pago
   */
  generateReference(idEstudiante: number, mesPagado: string): Observable<{ reference: string }> {
    const params = new HttpParams()
      .set('idEstudiante', idEstudiante.toString())
      .set('mesPagado', mesPagado);

    return this.http.get<{ reference: string }>(`${this.apiUrl}/generate-reference`, { params });
  }

  /**
   * Crea un link de pago de Wompi
   */
  createPaymentLink(request: WompiPaymentLinkRequest): Observable<WompiPaymentLinkResponse> {
    return this.http.post<WompiPaymentLinkResponse>(`${this.apiUrl}/payment-link`, request);
  }

  /**
   * Consulta el estado de una transacción
   */
  getTransactionStatus(transactionId: string): Observable<WompiTransactionResponse> {
    return this.http.get<WompiTransactionResponse>(`${this.apiUrl}/transaction/${transactionId}`);
  }

  /**
   * Obtiene el token de aceptación
   */
  getAcceptanceToken(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/acceptance-token`);
  }

  /**
   * Carga el script del widget de Wompi
   */
  loadWompiWidget(): Promise<void> {
    return new Promise((resolve, reject) => {
      if ((window as any).WidgetCheckout) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://checkout.wompi.co/widget.js';
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Error cargando widget de Wompi'));
      document.head.appendChild(script);
    });
  }

  /**
   * Abre el checkout de Wompi con el widget
   */
  async openCheckout(config: {
    publicKey: string;
    currency: string;
    amountInCents: number;
    reference: string;
    signature: string;
    redirectUrl: string;
    customerEmail?: string;
    customerFullName?: string;
  }): Promise<any> {
    await this.loadWompiWidget();

    return new Promise((resolve, reject) => {
      const checkout = new (window as any).WidgetCheckout({
        currency: config.currency,
        amountInCents: config.amountInCents,
        reference: config.reference,
        publicKey: config.publicKey,
        signature: {
          integrity: config.signature
        },
        redirectUrl: config.redirectUrl,
        customerData: {
          email: config.customerEmail,
          fullName: config.customerFullName
        }
      });

      checkout.open((result: any) => {
        const transaction = result.transaction;
        if (transaction) {
          resolve(transaction);
        } else {
          reject(new Error('Transacción cancelada o fallida'));
        }
      });
    });
  }
}
