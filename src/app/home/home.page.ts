import { Component, ViewChild } from '@angular/core';
import { ScannerServiceProvider } from '../Providers/scandit-scanner';
import { IonContent } from '@ionic/angular';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements ScannerDelegate {
public barcodes: Barcode[] = [];
  public continuousMode: boolean = false;

  @ViewChild(IonContent) private content: IonContent;

  constructor(public scanner: ScannerServiceProvider) {}

  public ionViewDidEnter(): void {
    // this.scanner.contentTop = this.content.contentTop;
    this.scanner.delegate = this;
    this.scanner.start();
  }

  public restartScan(){
    this.scanner.start();
  }

  public didScan(session: ScanSession) {
    if (!this.continuousMode) {
      session.pauseScanning();
    }
    this.barcodes = session.newlyRecognizedCodes;
  }

  public resumeScanning() {
    this.scanner.resume();
    this.barcodes = [];
  }

  public toggleContinuousMode() {
    this.continuousMode = !this.continuousMode;
    this.scanner.resume();
  }
}
