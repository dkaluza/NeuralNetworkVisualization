import { Component, OnInit } from '@angular/core';
import { SelectedArchitectureService } from '../selected-architecture/selected-architecture.service';


@Component({
  selector: 'app-selected-bar',
  templateUrl: './selected-bar.component.html',
  styleUrls: ['./selected-bar.component.css']
})
export class SelectedBarComponent implements OnInit {

  constructor(public selectedArchitectureService: SelectedArchitectureService) { }

  ngOnInit() {
  }

}
