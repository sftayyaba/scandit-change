import { Injectable, NgZone } from '@angular/core';
declare let Scandit: any;

@Injectable()
export class ScannerServiceProvider {
    
  public contentHeight;
  public delegate: ScannerDelegate;

  private picker;
  private _contentTop: number = 0;

  private portraitConstraints: Constraints;
  private landscapeConstraints: Constraints;

  constructor(
    private zone: NgZone,
  ) {
    Scandit.License.setAppKey("zn8d5lKp3n24Zm++bFnY9hLnxgi9580J/FLbzHwgbAc");
    var settings = new Scandit.ScanSettings();
    settings.setSymbologyEnabled(Scandit.Barcode.Symbology.CODE128, true);
    // Instantiate the barcode picker by using the settings defined above.
    this.picker = new Scandit.BarcodePicker(settings);
  }

  public get contentTop(): number {
    return this._contentTop;
  }

  public set contentTop(newValue: number) {
    this._contentTop = newValue;
    this.setScannerConstraints();
  }

  public start(): void {
    // We only want to pause the scanner if not in continuous mode, not stop it, so we're setting it to true here
    this.picker.continuousMode = true;

    this.picker.show({
      didScan: session => {
        if (this.delegate) {
          this.zone.run(() => {
            this.delegate.didScan(session);
          })
        }
      },
    });
    this.picker.startScanning();
  }

  public resume(): void {
    this.picker.resumeScanning();
  }

  // ================================================ //
  // ===== Constraint setting & related helpers ===== //
  // ================================================ //

  private setScannerConstraints(): void {
    const top = this.contentTop;
    if (top === undefined) {
      setTimeout(this.setScannerConstraints.bind(this), 500);
    }

    const topConstraint = top || 0;
    const rightConstraint = 0;
    const bottomConstraint = screen.height / 4;
    const leftConstraint = 0;

    this.contentHeight = screen.height - bottomConstraint - topConstraint;

    console.log(this.contentHeight, topConstraint, rightConstraint, bottomConstraint, leftConstraint);
    this.setConstraints(topConstraint, rightConstraint, bottomConstraint, leftConstraint);
  }

  private setConstraints(top: Constraint, right: Constraint, bottom: Constraint, left: Constraint, animationDuration: number = 0): void {
    const newConstraints = this.getConstraintsWith(top, right, bottom, left);
    this.setPortraitConstraints(newConstraints, animationDuration);
    this.setLandscapeConstraints(newConstraints, animationDuration);
  }

  private setPortraitConstraints(newConstraints: Constraints, animationDuration: number = 0): void {
    if (this.needsConstraintUpdates(this.portraitConstraints, newConstraints)) {
      this.portraitConstraints = newConstraints;
      this.applyConstraints(animationDuration);
    }
  }

  private setLandscapeConstraints(newConstraints: Constraints, animationDuration: number = 0): void {
    if (this.needsConstraintUpdates(this.landscapeConstraints, newConstraints)) {
      this.landscapeConstraints = newConstraints;
      this.applyConstraints(animationDuration);
    }
  }

  private getConstraintsWith(top: Constraint, right: Constraint, bottom: Constraint, left: Constraint, animationDuration: number = 0): Constraints {
    const newConstraints = new Scandit.Constraints();
    newConstraints.topMargin = top;
    newConstraints.rightMargin = right;
    newConstraints.bottomMargin = bottom;
    newConstraints.leftMargin = left;
    return newConstraints;
  }

  private needsConstraintUpdates(constraint: Constraints, newConstraints: Constraints): boolean {
    return !constraint ||
    newConstraints.topMargin !== constraint.topMargin ||
    newConstraints.rightMargin !== constraint.rightMargin ||
    newConstraints.bottomMargin !== constraint.bottomMargin ||
    newConstraints.leftMargin !== constraint.leftMargin
  }

  private applyConstraints(animationDuration: number = 0): void {
    this.picker.setConstraints(this.portraitConstraints, this.landscapeConstraints, animationDuration);
  }

}
