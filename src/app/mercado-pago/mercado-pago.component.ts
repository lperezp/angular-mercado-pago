import {
  AfterViewInit,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {
  CardToken,
  Identifications,
  Issuers,
  PaymentMethod,
} from '../models/MercadoPago.model';

declare const Mercadopago: any;

@Component({
  selector: 'app-mercado-pago',
  templateUrl: './mercado-pago.component.html',
  styleUrls: ['./mercado-pago.component.scss'],
})
export class MercadoPagoComponent implements OnInit, AfterViewInit {
  minDocNumber = 5;
  maxDocNumber = 20;
  typeDocNumber = 'string';
  paymentForm: FormGroup = this.fb.group({
    cardNumber: [
      '',
      [
        Validators.required,
        Validators.pattern('^[ 0-9]*$'),
        Validators.minLength(17),
      ],
    ],
    securityCode: ['', [Validators.required, Validators.minLength(3)]],
    cardExpirationMonth: ['', [Validators.required, Validators.minLength(2)]],
    cardExpirationYear: ['', [Validators.required, Validators.minLength(2)]],
    cardholderName: ['', Validators.required],
    docType: ['', [Validators.required]],
    docNumber: [
      '',
      [
        Validators.required,
        Validators.minLength(this.minDocNumber),
        Validators.maxLength(this.maxDocNumber),
      ],
    ],
  });
  publicKey = 'TEST-20ea027b-79b0-42de-beb1-222d2ca37d25';
  typesNeeded: boolean;
  identifications: Identifications[];
  @ViewChild('ccNumber') ccNumberField: ElementRef;
  @ViewChild('formContainer') formRef: ElementRef;
  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    this.appendScript().then(() => {
      Mercadopago.setPublishableKey(this.publicKey);
      this.getTypes();
    });
  }

  appendScript(): Promise<any> {
    return new Promise((resolve) => {
      const scriptTag = document.createElement('script');
      scriptTag.src =
        'https://secure.mlstatic.com/sdk/javascript/v1/mercadopago.js';
      scriptTag.onload = resolve;
      document.body.appendChild(scriptTag);
    });
  }

  getTypes(): void {
    Mercadopago.getIdentificationTypes(
      (err: number, data: Identifications[]) => {
        if (err !== 200) {
          throw err;
        }
        this.identifications = data;
        this.typesNeeded = true;
      }
    );
  }

  validateNumber(event): void {
    const pattern = /[0-9]/;
    const inputChar = String.fromCharCode(event.charCode);
    if (!pattern.test(inputChar)) {
      event.preventDefault();
    }
  }

  creditCardNumberSpacing(): void {
    const input = this.ccNumberField.nativeElement;
    const { selectionStart } = input;
    const { cardNumber } = this.paymentForm.controls;

    let trimmedCardNum = cardNumber.value.replace(/\s+/g, '');
    if (trimmedCardNum.length >= 6) {
      const str = trimmedCardNum.substring(0, 6);
      const bin = { bin: str };
      this.callGetPaymentMethod(bin);
    }
    if (trimmedCardNum.length > 16) {
      trimmedCardNum = trimmedCardNum.substr(0, 16);
    }

    /* Handle American Express 4-6-5 spacing */
    const partitions =
      trimmedCardNum.startsWith('34') || trimmedCardNum.startsWith('37')
        ? [4, 6, 5]
        : [4, 4, 4, 4];

    const numbers = [];
    let position = 0;
    partitions.forEach((partition) => {
      const part = trimmedCardNum.substr(position, partition);
      if (part) {
        numbers.push(part);
      }
      position += partition;
    });

    cardNumber.setValue(numbers.join(' '));

    /* Handle caret position if user edits the number later */
    if (selectionStart < cardNumber.value.length - 1) {
      input.setSelectionRange(selectionStart, selectionStart, 'none');
    }
  }

  callGetPaymentMethod(binObj): void {
    Mercadopago.getPaymentMethod(
      binObj,
      (err: number, handler: PaymentMethod[]) => {
        if (err !== 200) {
          throw err;
        }
        console.log('PaymentMethod', handler);
        const cardHandler = handler[0];
        this.getIssuers(cardHandler.id);
      }
    );
  }

  selectDocType(): void {
    // tslint:disable-next-line: no-string-literal
    const optionSelected = this.paymentForm.controls['docType'].value;
    const typeDoc = this.identifications.filter(
      (element) => element.id === optionSelected
    );
    const { min_length, max_length, type } = typeDoc[0];
    this.minDocNumber = min_length;
    this.maxDocNumber = max_length;
    this.typeDocNumber = type;
    // tslint:disable-next-line: no-string-literal
    this.paymentForm.controls['docNumber'].setValue('');
  }

  validateDocNumber(event): void {
    if (this.typeDocNumber === 'number') {
      const pattern = /[0-9]/;
      const inputChar = String.fromCharCode(event.charCode);
      if (!pattern.test(inputChar)) {
        event.preventDefault();
      }
    }
  }

  getIssuers(id: string): void {
    Mercadopago.getIssuers(id, (err: number, res: Issuers[]) => {
      if (err !== 200) {
        console.error(err);
        throw err;
      }
      console.log('Issuers', res);
    });
  }

  submit(): void {
    Mercadopago.createToken(
      this.formRef.nativeElement,
      (err: number, res: CardToken) => {
        if (err !== 200) {
          console.error(err);
          throw err;
        }
        console.log('CardToken', res);
      }
    );
  }
}
