import { Component, ElementRef, inject, Input, Renderer2, ViewChild } from '@angular/core';
import { NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Points24Card, Points24SimpleExpression } from '../../app/models/kidsgames.model';
import { Points24Service } from '../services/points-24.service';

@Component({
  selector: 'scratch-paper',
  standalone: true,
  imports: [NgClass, FormsModule],
  templateUrl: './scratch.component.html',
  styleUrl: './scratch.component.css'
})
export class ScratchComponent {

  @Input() stepIdx: number = 0;
  @Input() cards: Points24Card[] = [];
  @Input() selectedCards: boolean[] = [];
  @Input() 
  get expressions() {
    return this._expressions;
  }
  set expressions(value: Points24SimpleExpression[]) {
    this._expressions = value;
    this.init();
  }
  _expressions: Points24SimpleExpression[] = [];

  @ViewChild("operand1Container") divOperand1!: ElementRef; 
  @ViewChild("operand2Container") divOperand2!: ElementRef; 
  
  selectedOperator: string = "+";
  get disabledOperator() {
    return this.expressions[this.stepIdx].isDone;
  }
  set disabledOperator(value: boolean) {
    this.expressions[this.stepIdx].isDone = value;
  }
  //_disabledOperator: boolean = false;

  cardService: Points24Service = inject(Points24Service);

  constructor(private render: Renderer2) {}
  
  init() {
    this.selectedOperator = "+";
    this.disabledOperator = false;
    if (this.divOperand1) {
      const div = this.divOperand1.nativeElement as HTMLDivElement;
      this.render.removeClass(div, "border-0");
      if (div.children[0]) {
        this.render.removeChild(div, div.children[0]);
      }
    }
    if (this.divOperand2) {
      const div = this.divOperand2.nativeElement as HTMLDivElement;
      this.render.removeClass(div, "border-0");
      if (div.children[0]) {
        this.render.removeChild(div, div.children[0]);
      }
    }
  }

  onClickOperator(me: MouseEvent, step: number) {
    const e = me.currentTarget as HTMLInputElement;
    const op = e.value;
    this.updateOperator(step, op);
  }

  onDragStart(de: DragEvent) {
    if (de.target && de.target instanceof HTMLSpanElement) {
      const span = de.target as HTMLSpanElement;
      de.dataTransfer?.setData("id", span.id);
    }
  }
  onDragOver(de: DragEvent) {
    de.preventDefault();
  }
  onDrop(de: DragEvent) {
    de.preventDefault();
    let id = de.dataTransfer?.getData("id");
    // if dragged element has no id, return
    if (!id) return;
    const curDiv = de.currentTarget as HTMLDivElement;
    // if current div already has child, return
    if (curDiv?.childNodes.length > 0) return;
    const node = document.getElementById(id);
    // if dragged element is not found, return
    if (!node) return;
    // if dragged element neither image nor span, return
    if (!(node as any instanceof HTMLImageElement) && !(node as any instanceof HTMLSpanElement)) return;

    let htmlElement: any;
    const step = +curDiv.id.split('_')[1];
    let opdVal: number = -1;
    let opdIdx = curDiv.id.split('_')[0].includes("1") ? 1 : 2;
    const attr = this.findNgAttribute(curDiv.attributes);
    let newAttr!: Attr;
    if (attr) {
      newAttr = attr.cloneNode(true) as Attr;
    }

    if (node as any instanceof HTMLImageElement) {
      const img = node as HTMLImageElement;
      // if dragged image has no title, return
      if (!img.title) return;
      // if title is not an integer, return
      if (!Number.isInteger(+img.title)) return;
  
      opdVal = +img.title;
      const newImg = node.cloneNode(true) as HTMLImageElement;
      const cardCode = id.replace("card_", "");
      newImg.id = id.replace("card_", "operand_");
      newImg.draggable = false;
      this.updateNgAttribute(newImg.attributes, newAttr);
      this.selectedCards[this.cards.findIndex(c => c.code === cardCode)] = true;
      htmlElement = newImg as any;
    }
    if (node as any instanceof HTMLSpanElement) {
      const span = node as HTMLSpanElement;
      // if dragged span has no
      if (!span.innerText.trim()) return;
      // if inner text is not an integer, return
      if (!Number.isInteger(+span.innerText)) return;
      // dragged element's id does not match the format, return;
      if (!id.includes("_")) return;
      // dragged element's id does not match the format, return;
      const draggedStep = +id.split('_')[1];
      if (!Number.isInteger(draggedStep)) return;

      opdVal = +span.innerText;
      const newSpan = node.cloneNode(true) as HTMLSpanElement;
      newSpan.id = id.replace("result_", "operand_");
      newSpan.draggable = false;
      this.updateNgAttribute(newSpan.attributes, newAttr);
      this.render.setAttribute(span, "draggable", "false");
      this.expressions[draggedStep-1].resultDragged = true;
      if (span.parentElement && span.parentElement.parentElement) {
        const div = span.parentElement.parentElement as HTMLDivElement;
        this.render.addClass(div, 'flip');
      }
      htmlElement = newSpan as any;
    }

    if (this.stepIdx > 0)
      this.expressions[this.stepIdx-1].isDone = true;

    this.render.addClass(curDiv, "border-0")
    this.render.appendChild(curDiv, htmlElement);

    this.updateOperand(step, opdIdx, opdVal);
  }

  private findNgAttribute(attrs: NamedNodeMap): Attr | null {
    let attr = null;
    for (let i = 0; i < attrs.length; i++) {
      if (attrs[i].name.startsWith("_ngcontent-")) {
        attr = attrs[i];
        break;
      }
    }
    return attr;
  }

  private updateNgAttribute(attrs: NamedNodeMap, attr: Attr) {
    for (let i = 0; i < attrs.length; i++) {
      if (attrs[i].name.startsWith("_ngcontent-")) {
        attrs.removeNamedItem(attrs[i].name);
        break;
      }
    }
    attrs.setNamedItem(attr);
  }

  private updateOperator(step: number, operator: string) {
    let exp = this.expressions[step-1];
    exp.operator = operator;
    this.evaluateExpression(exp, step-1);
  }

  private updateOperand(step: number, operandIdx: number, operandValue: number) {
    let exp = this.expressions[step-1];
    if (operandIdx == 1)
      exp.operand1 = operandValue;
    if (operandIdx == 2)
      exp.operand2 = operandValue;

    this.evaluateExpression(exp, step-1);
  }

  private evaluateExpression(exp: Points24SimpleExpression, idx: number) {
    if (exp.operand1 >= 0 && exp.operand2 >= 0 && exp.operator != "") {
      const str = exp.operand1 + exp.operator + exp.operand2;
      let result = this.cardService.calculateOneExpression(str, exp.operator);
      this.expressions[idx].result = result.toString();
      exp.isFailed = (result < 0 || !Number.isInteger(result));
    }
  }

}
