import './App.css'
import { prepareStarforce, runStarforce, splashEffects } from './engine.js'
import { Flex, Typography, List, Button, Card, Divider, Modal } from 'antd'
import { useState } from 'react'
import { CaretUpFilled, CaretDownFilled, FireFilled, MinusSquareFilled } from '@ant-design/icons'


function DisplayResult(props) {
  const { item } = props

  const color = (
    item.result === 'success'     ? 'green'
    : item.result === 'stagedown' ? 'red'
    : item.result === 'destroy'   ? 'grey'
    : item.result === 'failed'    ? 'darkred'
    : null
  )

  const icon = (
    item.result === 'success'     ? <CaretUpFilled />
    : item.result === 'stagedown' ? <CaretDownFilled />
    : item.result === 'destroy'   ? <FireFilled />
    : item.result === 'failed'    ? <MinusSquareFilled />
    : null
  )

  const resultText = (
    item.result === 'success'     ? '성공'
    : item.result === 'stagedown' ? '하락'
    : item.result === 'destroy'   ? '파괴'
    : item.result === 'failed'    ? '실패'
    : null
  )

  return (
    <div style={{ fontWeight: 'bold', color }}>
      {icon} {resultText}
    </div>
  )
}


function Header() {
  return (
    <Flex align='baseline'>
      <Typography.Title level={1}>스타포스 시뮬레이터&nbsp;</Typography.Title>
      <Typography.Text code>by. yumtam</Typography.Text>
    </Flex>
  )
}

function RecentCard(props) {
  const { recent, disabled } = props

  const toStage = (item) => (
    item.result === 'success'     ? item.stage + 1
    : item.result === 'stagedown' ? item.stage - 1
    : item.result === 'destroy'   ? 12
    : item.result === 'failed'    ? item.stage
    : null
  )

  return (
    <Card title="최근 시도 기록" bordered={false} style={{ width: '290px' }}>
      <List
        style={{ height: '400px', overflow: 'auto' }}
        bordered={false}
        dataSource={recent}
        renderItem={(item) => (
          <List.Item>
            <Flex align='baseline'>
              <Typography.Text code>
                {toStage(item)}성
              </Typography.Text>
              &nbsp;
              <DisplayResult item={item} />
            </Flex>
          </List.Item>
        )}
      />
    </Card>
  )
}


function Controls(props) {
  return (
    <Flex justify='space-between'>
      <Button
        onClick={() => {
          Modal.confirm({
            title: '저희는 확률을 절대 조작하지 않습니다 :)',
            content: '소스코드를 확인해보세요!',
            footer: (_, { OkBtn, CancelBtn }) => (
              <>
                <CancelBtn />
                <Button 
                  type='primary' 
                  onClick={ () => window.open('https://github.com/yumtam/light-police/blob/master/src/engine.js', '_blank') }
                >
                  확인하기
                </Button>
              </>
            ),
          })
        }}
      >
        소스코드 보기
      </Button>
      <Button
        type="primary"
        disabled={props.disabled}
        onClick={() => { splashEffects(); runStarforce(props.context) }}
        onMouseEnter={splashEffects}
        onMouseLeave={splashEffects}
      >
        도전하기
      </Button>
    </Flex>
  )
}

const ControlBlock = (props) => {
  const { context } = props
  const { probs, recent, stageDescription, gameState } = context

  return (
    <Flex vertical align='center' justify='center'>
      <Card bordered={false} style={{ width: '290px', marginBottom: '32px' }}>
        {recent.length === 0 ? '...' :
          <DisplayResult item={recent[0]} />
        }
      </Card>
      <Card title={stageDescription} bordered={false} style={{ width: '290px' }}>
        <List
          bordered={false}
          dataSource={probs}
          renderItem={(item) => (
            <List.Item>
              {item}
            </List.Item>
          )}
        />
        <Divider />
        <Controls
          context={context}
          disabled={gameState !== 'ready'}
        />
      </Card>
    </Flex>
  )
}

function App() {
  const [gameState, setGameState] = useState('preparing')
  const [stage, setStage] = useState(12)
  const [recent, setRecent] = useState([])
  const [probs, setProbs] = useState([])
  const [stageDescription, setStageDescription] = useState('')

  const context = {
    gameState, setGameState,
    stage, setStage,
    recent, setRecent,
    probs, setProbs,
    stageDescription, setStageDescription,
  }

  if (gameState === 'preparing') {
    prepareStarforce(context, stage)
  }

  return (
    <Flex
      vertical align='center' justify='center'
      style={{ width: '100vw', height: '100vh', background: '#f4f5f9' }}
    >
      <Flex vertical align='flex-start'>
        <Header />
        <div
          style={{
            width: '900px', height: '500px', marginTop: '36px', padding: '36px',
            background: '#FFE5CC', borderRadius: '36px'
          }}
        >
          <Flex align='flex-start' justify='space-between'>
            <RecentCard
              item={recent[0]}
              stage={stage}
              recent={recent}
            />
            <img
              id='item-image'
              src={`./imgs/${stage}.png`}
              width='250px' height='auto'
            />
            <ControlBlock context={context} />
          </Flex>
        </div>
      </Flex>
    </Flex>
  )
}

export default App
