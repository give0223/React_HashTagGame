import React from 'react';
import ReactDOM from 'react-dom';
import {Redux,createStore} from 'redux';

class ClearBoard extends React.Component{
  constructor(props){
    super(props);
    this.state = props.state;
  }
  render(){

  }
}

//線段組件
class Line extends React.Component{
  render(){
    let startX = this.props.start_Index%3;
    let startY = Math.floor(this.props.start_Index/3);
    let endX = this.props.end_Index%3;
    let endY = Math.floor(this.props.end_Index/3);
    return <svg className='line'>
            <line x1={startX*100+50} y1={startY*100+50} x2={endX*100+50} y2={endY*100+50} stroke='green' strokeWidth='5'/>    
          </svg>;
  }
}

//框框組件
class Cell extends React.Component{
  render(){
    let text='';
    if(this.props.mark === 0){
      text = 'O'
    }else if(this.props.mark === 1){
      text = 'X';
    }
    return <div className='cell' onClick={this.click.bind(this)}>{text}</div>;
  }
  //使用者點擊更新框框標記
  click(){
    //呼叫Board內的updateMark方法傳遞框框編號參數
    this.props.update(this.props.index);
  }
}

//主要遊戲框架
class Board extends React.Component{
  constructor(props){
    super(props);
    //設定狀態
    this.state = redux.store.getState();
  }
  render(){
    let cells=[];
    //將框框的資訊顯示到陣列
    //傳到cell參數=> index框框編號,mark框框內標記資訊,update回傳更新框框內標記
    for (let i = 0; i < this.state.marks.length; i++) {
      cells.push(<Cell index={i} mark={this.state.marks[i]} update={this.updateMark.bind(this)}/>);
    }
    //如果有贏家出現,則畫出贏家線段
    if(this.state.winner !== null){
      //取得贏家線段起始位置及線段結束位置
      cells.push(<Line start_Index={this.state.winner.startIndex} end_Index={this.state.winner.endIndex}/>);
    }
    //將主畫面畫出
    return <div className='container'>
              <div className='board'>
                {cells}
              </div>
              {/* <button className='restart'>ReStart</button> */}
           </div>;
  }

  //更新框框內標記
  updateMark(index){
    redux.store.dispatch({
      type:'UpdateMark',
      index:index
    });
  }
  
  //建立Redux連結
  refresh(){
    this.setState(redux.store.getState());
  }

  componentDidMount(){
    this.unsubscribe = redux.store.subscribe(this.refresh.bind(this));
  }
  componentWillUnmount(){
    this.unsubscribe();
  }
}

//Redux程式
let redux = {
  store: null,
  reducer: function(state, action) {
    switch (action.type) {
      case 'UpdateMark':
        let currentMark = state.marks[action.index];
        /*1.框框標記為空白
          2.沒有贏家
          才觸發變更事件
        */
        if(currentMark === -1 && state.winner === null){
          this.setState((state) =>{
            let mark = state.circle%2; //根據回合數決定標記, 0畫圈, 1畫叉
            state.marks[action.index] = mark; //將標記回傳到狀態marks陣列中
            //標記更新後將標記陣列傳給checkWinner方法確認是否有贏家
            let isWinner = redux.checkWinner(state.marks);
            return {
              circle: state.circle + 1,
              marks:state.marks,
              winner: isWinner
            };
          });
        }else{
          //不符合更新條件,不更新狀態回傳原始狀態
          return state;
        }
    
      default:
        return;
    }
  },
  //檢查是否有贏家出現
  checkWinner: function(marks){
    //如果有贏家則回傳
    //{side:贏家為O或X,startIndex:線段起始框框編號,endIndex:線段結束框框編號}
    
    //從水平方向偵測
    for(let y = 0; y < 3; y++){
      //可能組合=>[0,1,2],[3,4,5],[6,7,8]
      if(marks[y*3]!== -1 && marks[y*3] === marks[y*3+1] && marks[y*3+1] === marks[y*3+2]){
        return {side:marks[y*3],startIndex:y*3,endIndex:y*3+2};
      }
    }
    //從垂直方向偵測
    for(let x = 0; x < 3; x++){
      //可能組合=>[0,3,6],[1,4,7],[2,5,8]
      if(marks[x]!== -1 && marks[x] === marks[x+3] && marks[x+3] === marks[x+6]){
        return {side:marks[x],startIndex:x,endIndex:x+6};
      }
    }
    //從斜線方向偵測
    //可能組合=>[0,4,8],[2,4,6]
    if(marks[0]!== -1 && marks[0] === marks[4] && marks[4] === marks[8]){
      return {side:marks[0],startIndex:0,endIndex:8};
    }else if(marks[2]!== -1 && marks[2] === marks[4] && marks[4] === marks[6]){
      return {side:marks[2],startIndex:2,endIndex:6};
    }
    //目前未出現贏家
    return null;
  }
};

window.addEventListener('load',() =>{
  //初始化 Redux 儲存空間
  redux.store = createStore(redux.reducer,{
    //框框編號為0~8(index)
    circle:0, //回合數
    marks: [-1, -1, -1, -1, -1, -1, -1, -1, -1], //框框標示: -1是空白 0是圈 1是叉
    winner:null //贏家資訊,null代表沒有
  });
  ReactDOM.render(<Board/>,document.body);
});