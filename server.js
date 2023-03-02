const express = require('express');
const cors = require('cors');
const app = express();

app.use(express.json());
app.use(cors({
    origin: true, // 모든 출처 허용 옵션. true 를 써도 된다.
}));
app.get('/', function(req,res){
    res.json({
        name: "이름"
    });
});

app.listen(80, function(){
    console.log('on 80');
});