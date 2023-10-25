import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'search'
})
export class SearchPipe implements PipeTransform {
  transform(items: any[], searchKey: string, property: any[]): any[] {
    if (items.length === 0 || !searchKey) {
      return items;
    }
    else if (property.length >= 1) {
      let newList: any[] = [];
      for (let item of items) {
        let first = item[property[0]]
        let firstName = first[property[1].fname]
        let lastName = first[property[1].lname]
        let name = firstName + lastName
        if (name.toLowerCase().includes(searchKey.trim().toLowerCase())) {
          newList.push(item);
        }
      }
      return newList;
    }
    let newList: any[] = [];
    for (let item of items) {
      let first = item[property[0]].trim()
      if (first.toLowerCase().includes(searchKey.trim().toLowerCase())) {
        newList.push(item);
      }
    }
    return newList;
  }
}

