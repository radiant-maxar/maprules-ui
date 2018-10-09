import { Component, OnInit, Input } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-link',
  templateUrl: './link.component.html',
  styleUrls: ['./link.component.css']
})


export class LinkComponent implements OnInit {
  @Input() navLocation: string;

  constructor(private route: ActivatedRoute) { }
  ngOnInit() {}

}
